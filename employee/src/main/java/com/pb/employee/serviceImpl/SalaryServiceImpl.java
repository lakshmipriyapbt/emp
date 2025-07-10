package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import com.pb.employee.service.PayslipService;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import com.pb.employee.service.SalaryService;
import com.pb.employee.service.TDSService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SalaryServiceImpl implements SalaryService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private  OpenSearchOperations openSearchOperations;
    @Autowired
    private EmployeeServiceImpl employeeService;
    @Autowired
    private Configuration freemarkerConfig;
    @Autowired
    PayslipService payslipService;

    @Autowired
    private TDSService tdsService;

    @Override
    public ResponseEntity<?> addSalary(EmployeeSalaryRequest employeeSalaryRequest, String employeeId) throws EmployeeException {
        LocalDateTime currentDateTime = LocalDateTime.now();
        String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String salaryId = ResourceIdUtils.generateSalaryResourceId(employeeId, timestamp);
        EmployeeEntity entity;
        String index = ResourceIdUtils.generateCompanyIndex(employeeSalaryRequest.getCompanyName());
        EmployeeSalaryEntity employeesSalaryProperties = null;
        List<SalaryConfigurationEntity> salaryConfigurationEntity;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            entity = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (entity.getStatus().equals(EmployeeStatus.INACTIVE.getStatus())){
                log.error("employee is inActive {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPLOYEE_INACTIVE)))),
                        HttpStatus.CONFLICT);
            }
            if (entity != null) {
                validateSalaries(employeeSalaryRequest, employeeId, index, formatter);
                salaryConfigurationEntity = openSearchOperations.getSalaryStructureByCompanyDate(employeeSalaryRequest.getCompanyName());
                log.debug("Fetched Salary Configurations: {}", salaryConfigurationEntity);

                if (salaryConfigurationEntity.size() == 0){
                    log.error("Exception while fetching the company salary structure");
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().
                                    createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                            .getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_NOT_FOUND)))),
                            HttpStatus.FORBIDDEN);
                }
                for (SalaryConfigurationEntity salaryConfiguration : salaryConfigurationEntity) {
                    if (salaryConfiguration.getStatus().equals(EmployeeStatus.ACTIVE.getStatus())) {
                        LocalDate salaryDate = LocalDate.parse(employeeSalaryRequest.getAddSalaryDate(), formatter);
                        int year = salaryDate.getYear();
                        TDSResPayload tdsResPayload = tdsService.getCompanyYearTDS(employeeSalaryRequest.getCompanyName(), String.valueOf(year), employeeSalaryRequest.getTdsType());
                        employeesSalaryProperties = CompanyUtils.maskEmployeesSalaryProperties(employeeSalaryRequest, salaryId, employeeId, salaryConfiguration, tdsResPayload);
                    }
                }

                if (employeesSalaryProperties != null) {
                    log.debug("Prepared salary entity: {}", employeesSalaryProperties);
                    Entity result = openSearchOperations.saveEntity(employeesSalaryProperties, salaryId, index);
                }
            } else {
                log.error("Employee not found");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), HttpStatus.NOT_FOUND);
            }
        } catch (EmployeeException exception) {
            log.error("Employee Exception: {}", exception.getMessage(), exception);
            throw exception; // Maintain original exception
        } catch (IOException exception) {
            log.error("IOException while saving salary details: {}", exception.getMessage(), exception);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SAVE_SALARY), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }


    @Override
    public ResponseEntity<?> getEmployeeSalaryById(String companyName, String employeeId,String salaryId) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
        if (employee==null){
            log.error("Exception while fetching employee for salary {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        EmployeeSalaryEntity entity = null;
        try {

            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity == null || !(entity instanceof EmployeeSalaryEntity)) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found {}", salaryId, employeeId, entity.getEmployeeId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            entity= EmployeeUtils.unMaskEmployeeSalaryProperties(entity);
        }
        catch (Exception ex) {
            log.error("Exception while fetching salaries for employees {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);

    }

    @Override
    public List<EmployeeSalaryResPayload> getEmployeeSalary(String companyName, String employeeId) throws EmployeeException {
        try {
           List<EmployeeSalaryResPayload> employeeSalaryResPayload = validateEmployeesSalaries(companyName, employeeId);
            if (employeeId == null) {
                return employeeSalaryResPayload.stream().filter(employeeSalaryRes -> employeeSalaryRes.getStatus().equalsIgnoreCase(Constants.ACTIVE)).collect(Collectors.toList());
            }
            return employeeSalaryResPayload;

        } catch (EmployeeException ex){
            log.error("Exception while fetching the employee salaries", ex);
            throw ex;
        }
        catch (Exception ex) {
            log.error("Exception while fetching salaries for employees {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteEmployeeSalaryById(String companyName, String employeeId,String salaryId) throws EmployeeException{
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeSalaryEntity entity = null;
        try {
            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for salary {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            openSearchOperations.deleteEntity(salaryId, index);
        }
        catch (Exception ex) {
            log.error("Exception while deleting salaries for employees {}: {}", salaryId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

    }

    public ResponseEntity<?> updateEmployeeSalaryById(String employeeId, SalaryUpdateRequest salaryUpdateRequest, String salaryId) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(salaryUpdateRequest.getCompanyName());
        EmployeeEntity employee = null;
        EmployeeSalaryEntity entity = null;
        try {
            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for salary {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee !=null && entity.getStatus().equals(EmployeeStatus.INACTIVE.getStatus())){
                log.error("employee is inActive {}", employeeId);
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPLOYEE_INACTIVE)))),
                        HttpStatus.CONFLICT);
            }
            int noOfChanges = EmployeeUtils.duplicateSalaryProperties(entity, salaryUpdateRequest);
            if (noOfChanges==0){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.SALARY_ALREADY_EXIST)))),
                        HttpStatus.CONFLICT);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching user {}:", employeeId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Entity employeeSalaryProperties = CompanyUtils.maskUpdateSalary(salaryUpdateRequest, entity);
        openSearchOperations.saveEntity(employeeSalaryProperties, salaryId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    private List<EmployeeSalaryResPayload> validateEmployeesSalaries(String companyName, String employeeId) throws EmployeeException {
        try {
            List<EmployeeSalaryResPayload> employeeSalaryResPayloads = new ArrayList<>();
            List<EmployeeSalaryEntity> allSalaries = openSearchOperations.getEmployeeSalaries(companyName, employeeId, null);

            if (allSalaries == null || allSalaries.isEmpty()) {
                log.error("Employees salaries do not exist in the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            for (EmployeeSalaryEntity employeeSalaryEntity : allSalaries){
                    EmployeeUtils.unMaskEmployeeSalaryProperties(employeeSalaryEntity);
                    EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeSalaryEntity.getEmployeeId(), null, index);

                    EmployeeSalaryResPayload resPayload = new EmployeeSalaryResPayload();
                    BeanUtils.copyProperties(employeeSalaryEntity, resPayload);
                    resPayload.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                    resPayload.setEmployeeCreatedId(employee.getEmployeeId());

                    employeeSalaryResPayloads.add(resPayload);

            }
            return employeeSalaryResPayloads;

        } catch (Exception ex) {
            log.error("Error validating employee salaries: {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Scheduled(cron = "0 0 0 * * ?")
    public void updateSalariesByAddDate() throws EmployeeException {
        log.info("Running scheduled salary update...");

        List<CompanyEntity> companyEntities = openSearchOperations.getCompanies();
        for (CompanyEntity companyEntity :companyEntities) {
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
            List<EmployeeSalaryEntity> allSalaries = openSearchOperations.getEmployeeSalaries(companyEntity.getShortName(), null, null);

            Map<String, List<EmployeeSalaryEntity>> groupedByEmployee = allSalaries.stream()
                    .collect(Collectors.groupingBy(EmployeeSalaryEntity::getEmployeeId));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate today = LocalDate.now();

            for (Map.Entry<String, List<EmployeeSalaryEntity>> entry : groupedByEmployee.entrySet()) {
                List<EmployeeSalaryEntity> employeeSalaries = entry.getValue();

                for (EmployeeSalaryEntity salary : employeeSalaries) {
                    if (Constants.APPRAISAL.equalsIgnoreCase(salary.getStatus())) {
                        LocalDate addDate = LocalDate.parse(salary.getAddSalaryDate(), formatter);
                        if (!addDate.isAfter(today)) {
                            salary.setStatus(Constants.ACTIVE);
                            // Set others to IN_ACTIVE
                            openSearchOperations.saveEntity(salary, salary.getSalaryId(), index);
                            for (EmployeeSalaryEntity other : employeeSalaries) {
                                if (!other.equals(salary)) {
                                    other.setStatus(Constants.IN_ACTIVE);
                                    openSearchOperations.saveEntity(other, other.getSalaryId(), index);

                                }
                            }
                            break; // Process only the first valid appraisal
                        }
                    }
                }
            }
        }
    }

    private void validateSalaries(EmployeeSalaryRequest employeeSalaryRequest,  String employeeId, String index, DateTimeFormatter formatter) throws EmployeeException {
        List<EmployeeSalaryEntity> salary = openSearchOperations.getEmployeeSalaries(employeeSalaryRequest.getCompanyName(), employeeId, null);
        LocalDate newSalaryDate = LocalDate.parse(employeeSalaryRequest.getAddSalaryDate(), formatter);
        String newGross = employeeSalaryRequest.getGrossAmount();
        LocalDate today = LocalDate.now();
        LocalDate existingSalaryDate = null;
        if (salary == null && salary.isEmpty()) {
            return;
        }
        EmployeeSalaryEntity appraisalSalary = salary.stream()
                .filter(s -> Constants.APPRAISAL.equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElse(null);
        if (appraisalSalary!=null){
            log.error("Employee already have appraisal salary");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.APPRAISAL_IS_ALREADY_EXIST), HttpStatus.BAD_REQUEST);
        }
        EmployeeSalaryEntity activeSalary = salary.stream()
                .filter(s -> Constants.ACTIVE.equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElse(null);

        if (activeSalary == null) {
            return;
        }
        String existingGross = new String(Base64.getDecoder().decode(activeSalary.getGrossAmount()));
        if (Constants.ACTIVE.equalsIgnoreCase(activeSalary.getStatus()) && existingGross.equals(newGross)) {
            log.error("Employee already have same salary");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.SALARY_ALREADY_EXIST), HttpStatus.BAD_REQUEST);
        }

        if (activeSalary.getAddSalaryDate() != null && !activeSalary.getAddSalaryDate().isEmpty()) {
            existingSalaryDate = LocalDate.parse(activeSalary.getAddSalaryDate(), formatter);
        }
        if (existingSalaryDate != null && newSalaryDate.isBefore(existingSalaryDate)) {
            log.error("The salary sate cannot be before the existed salary date");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_ADD_SALARY_DATE), HttpStatus.BAD_REQUEST);
        }
        if (!newSalaryDate.isAfter(today)) {
            activeSalary.setStatus(EmployeeStatus.INACTIVE.getStatus());
            openSearchOperations.saveEntity(activeSalary, activeSalary.getSalaryId(), index);
        }else{
            employeeSalaryRequest.setStatus(Constants.APPRAISAL);
        }
    }
}