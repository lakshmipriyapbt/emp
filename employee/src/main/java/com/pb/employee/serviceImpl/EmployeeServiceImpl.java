package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.EmployeeRequest;
import com.pb.employee.request.EmployeeUpdateRequest;
import com.pb.employee.service.EmployeeService;
import com.pb.employee.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;
    @Autowired
    private EmailUtils emailUtils;

    @Override
    public ResponseEntity<?> registerEmployee(EmployeeRequest employeeRequest, HttpServletRequest request) throws EmployeeException{
        // Check if a company with the same short or company name already exists
        log.debug("validating name {} employee Id {} exsited ", employeeRequest.getLastName(), employeeRequest.getEmployeeId());
        String resourceId = ResourceIdUtils.generateEmployeeResourceId(employeeRequest.getEmailId());
        Object entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(employeeRequest.getCompanyName());
        try{
            entity = openSearchOperations.getById(resourceId, null, index);
            if(entity != null) {
                log.error("employee details existed{}", employeeRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_EMAILID_ALREADY_EXISTS), employeeRequest.getEmailId()),
                        HttpStatus.CONFLICT);
            }
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(employeeRequest.getCompanyName());

            Map<String, Object> duplicateValues = EmployeeUtils.duplicateValues(employeeRequest, employees);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
        } catch (IOException e) {
            log.error("Unable to get the company details {}", employeeRequest.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), employeeRequest.getEmailId()),
                    HttpStatus.BAD_REQUEST);
        }
        List<EmployeeEntity> employeeByData = openSearchOperations.getCompanyEmployeeByData(employeeRequest.getCompanyName(), employeeRequest.getEmployeeId(),
                employeeRequest.getEmailId());
        if(employeeByData !=null && employeeByData.size() > 0) {
            log.error("Employee with emailId {} already existed", employeeRequest.getEmployeeId());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_ID_ALREADY_EXISTS), employeeRequest.getEmployeeId()),
                    HttpStatus.CONFLICT);
        }
        try{
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
                departmentEntity = openSearchOperations.getDepartmentById(employeeRequest.getDepartment(), null, index);
                if (departmentEntity == null){

                }
                designationEntity = openSearchOperations.getDesignationById(employeeRequest.getDesignation(), null, index);
                if (designationEntity == null){
                    return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                        HttpStatus.CONFLICT);
                }
            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, employeeRequest.getCompanyName());

            Entity companyEntity = EmployeeUtils.maskEmployeeProperties(employeeRequest, resourceId, shortNameEntity.getFirst().getId());
            Entity result = openSearchOperations.saveEntity(companyEntity, resourceId, index);
        } catch (Exception exception) {
            log.error("Unable to save the employee details {} {}", employeeRequest.getEmailId(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Send the email with company details
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request)+Constants.UPDATE_NEW_PASSWORD;
                log.info("The company url : "+companyUrl);// Example URL
                emailUtils.sendRegistrationEmail(employeeRequest.getEmailId(), companyUrl,Constants.EMPLOYEE);
            } catch (Exception e) {
                log.error("Error sending email to employee: {}", employeeRequest.getEmailId());
                throw new RuntimeException(e);
            }
        });

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    @Override
    public ResponseEntity<?> getEmployees(String companyName) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<EmployeeEntity> employeeEntities = null;

        try {
            LocalDate currentDate = LocalDate.now();
            employeeEntities = openSearchOperations.getCompanyEmployees(companyName);

            for (EmployeeEntity employee : employeeEntities) {
                DepartmentEntity entity = null;
                DesignationEntity designationEntity = null;

                if (employee.getDepartment() != null && employee.getDesignation() != null) {
                    entity = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
                    designationEntity = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
                }
                // Unmask employee properties
                EmployeeUtils.unmaskEmployeeProperties(employee, entity, designationEntity);
                // Fetch relieving details for each employee
                RelievingEntity relievingDetails = openSearchOperations.getRelievingByEmployeeId(employee.getId(),null,companyName);
                // Set status only if relieving details are found
                if (relievingDetails != null) {
                    LocalDate startDate = LocalDate.parse(relievingDetails.getResignationDate());
                    LocalDate endDate = LocalDate.parse(relievingDetails.getRelievingDate());

                    if (startDate != null && endDate != null) {
                        String status = null;
                        if ((currentDate.isEqual(startDate) || currentDate.isAfter(startDate)) && currentDate.isBefore(endDate)) {
                            status = Constants.NOTICE_PERIOD;
                        } else if (currentDate.isEqual(endDate) || currentDate.isAfter(endDate)) {
                            status = Constants.INACTIVE;
                        }

                        if (status != null && !status.equals(employee.getStatus())) {
                            employee.setStatus(status);

                            // Perform partial update for status only
                            Map<String, Object> partialUpdate = new HashMap<>();
                            partialUpdate.put(Constants.STATUS, status);
                            openSearchOperations.partialUpdate(employee.getId(), partialUpdate, index);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Exception while fetching employees for company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(employeeEntities), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getEmployeeById(String companyName, String employeeId) throws EmployeeException {
        log.info("getting details of {}", employeeId);
        EmployeeEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            if (entity.getDepartment() !=null && entity.getDesignation() !=null) {
                departmentEntity = openSearchOperations.getDepartmentById(entity.getDepartment(), null, index);
                designationEntity = openSearchOperations.getDesignationById(entity.getDesignation(), null, index);
                EmployeeUtils.unmaskEmployeeProperties(entity, departmentEntity, designationEntity);

            }
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateEmployeeById(String employeeId, EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException {
          log.info("getting details of {}", employeeId);
        EmployeeEntity user;
        String index = ResourceIdUtils.generateCompanyIndex(employeeUpdateRequest.getCompanyName());
        try {
            user = openSearchOperations.getEmployeeById(employeeId, null, index);
            List<EmployeeEntity> employees = openSearchOperations.getCompanyEmployees(employeeUpdateRequest.getCompanyName());
            employees.removeIf(employee -> employee.getId().equals(employeeId));
            Map<String, Object> duplicateValues = EmployeeUtils.duplicateUpdateValues(employeeUpdateRequest, employees);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
            if (user == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex) {

            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        DesignationEntity designationEntity = null;
        DepartmentEntity departmentEntity = null;
        departmentEntity = openSearchOperations.getDepartmentById(employeeUpdateRequest.getDepartment(), null, index);
        if (departmentEntity == null){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
                    HttpStatus.CONFLICT);
        }
        designationEntity = openSearchOperations.getDesignationById(employeeUpdateRequest.getDesignation(), null, index);
        if (designationEntity == null){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                    HttpStatus.CONFLICT);
        }
        int noOfChanges = EmployeeUtils.duplicateEmployeeProperties(user, employeeUpdateRequest);
        if (noOfChanges==0){
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_DATA_EXIST)))),
                    HttpStatus.CONFLICT);
        }
        Entity entity = CompanyUtils.maskEmployeeUpdateProperties(user, employeeUpdateRequest);
        openSearchOperations.saveEntity(entity, employeeId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> deleteEmployeeById(String companyName, String employeeId) throws EmployeeException {
        log.info("Attempting to delete employee with ID: {}", employeeId);
        EmployeeEntity entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
        } catch (Exception ex) {
            log.error("Exception while fetching employee details: {}", ex.getMessage(), ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        if (entity == null) {
            log.error("Employee not found in company: {}", companyName);
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), employeeId),
                    HttpStatus.NOT_FOUND
            );
        }
        try {
            openSearchOperations.deleteEntity(employeeId, index);
        } catch (Exception ex) {
            log.error("Exception while deleting employee: {}", ex.getMessage(), ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED),
                HttpStatus.OK
        );
    }
}