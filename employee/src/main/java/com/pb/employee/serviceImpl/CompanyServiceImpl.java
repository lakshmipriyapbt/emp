package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.request.CompanyImageUpdate;
import com.pb.employee.request.CompanyRequest;
import com.pb.employee.request.CompanyUpdateRequest;
import com.pb.employee.request.EmployeePasswordReset;
import com.pb.employee.service.CompanyService;
import com.pb.employee.util.CompanyUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EmployeeUtils;
import com.pb.employee.util.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    @Value("${file.upload.path}")
    private  String folderPath;

    @Autowired
    private  OpenSearchOperations openSearchOperations;


    @Override
    public ResponseEntity<?> registerCompany(CompanyRequest companyRequest) throws EmployeeException{
        // Check if a company with the same short or company name already exists
        log.debug("validating shortname {} company name {} exsited ", companyRequest.getShortName(), companyRequest.getCompanyName());
        String resourceId = ResourceIdUtils.generateCompanyResourceId(companyRequest.getCompanyName());
        String index = ResourceIdUtils.generateCompanyIndex(companyRequest.getShortName());
        Object entity = null;
        try{

            entity = openSearchOperations.getById(resourceId, null, Constants.INDEX_EMS);
            if(entity != null) {
                log.error("Company details existed{}", companyRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_ALREADY_EXISTS), companyRequest.getCompanyName()),
                        HttpStatus.CONFLICT);
            }
            List<CompanyEntity> companyEntities = openSearchOperations.getCompanies();

            Map<String, Object> duplicateValuesInTheCompany = CompanyUtils.duplicateValuesInCompany(companyRequest);
            if (!duplicateValuesInTheCompany.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValuesInTheCompany),
                        HttpStatus.CONFLICT
                );
            }
            Map<String, Object> duplicateValues = CompanyUtils.duplicateValues(companyRequest, companyEntities);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
        } catch (IOException e) {
            log.error("Unable to get the company details {}", companyRequest.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyRequest.getCompanyName()),
                    HttpStatus.BAD_REQUEST);
        }

        String companyType = companyRequest.getCompanyType();
        if (companyType.equals(Constants.PRIVATE)){
            if (companyRequest.getCinNo()==null || companyRequest.getCinNo().isEmpty()){
                log.error("Company cin number is required");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_CIN_NO_REQUIRED), companyRequest.getShortName()),
                        HttpStatus.BAD_REQUEST);
            }

        }else if (companyType.equals(Constants.FIRM)){
            if (companyRequest.getCompanyRegNo()==null || companyRequest.getCompanyRegNo().isEmpty()){
                log.error("Company Registration number is required");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_REG_NO_REQUIRED), companyRequest.getShortName()),
                        HttpStatus.BAD_REQUEST);
            }
        }
        List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyRequest.getShortName());
        if(shortNameEntity !=null && shortNameEntity.size() > 0) {
            log.error("Company with shortname {} already existed", companyRequest.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_SHORT_NAME_ALREADY_EXISTS), companyRequest.getShortName()),
                    HttpStatus.CONFLICT);
        }
        try{
            Entity companyEntity = CompanyUtils.maskCompanyProperties(companyRequest, resourceId);
            Entity result = openSearchOperations.saveEntity(companyEntity, resourceId, Constants.INDEX_EMS);
        } catch (Exception exception) {
            log.error("Unable to save the company details {} {}", companyRequest.getCompanyName(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        openSearchOperations.createIndex(companyRequest.getShortName());
        String password = Base64.getEncoder().encodeToString(companyRequest.getPassword().getBytes());
        log.info("Creating the employee of company admin");

        String employeeAdminId = ResourceIdUtils.generateEmployeeResourceId(companyRequest.getEmailId());
        EmployeeEntity employee = EmployeeEntity.builder().
                id(employeeAdminId).
                employeeType(Constants.EMPLOYEE_TYPE).
                employeeId(employeeAdminId).
                companyId(resourceId).
                emailId(companyRequest.getEmailId()).
                password(password).
                type(Constants.EMPLOYEE).
                build();
        openSearchOperations.saveEntity(employee, employeeAdminId, index);
        // Map the request to an entity
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getCompanies( HttpServletRequest request) throws EmployeeException {

        List<CompanyEntity> companyEntities = null;
        companyEntities = openSearchOperations.getCompanies();
        for(CompanyEntity companyEntity : companyEntities) {
            CompanyUtils.unmaskCompanyProperties(companyEntity, request);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(companyEntities), HttpStatus.OK);

    }

    @Override
    public ResponseEntity<?> getCompanyById(String companyId, HttpServletRequest request)  throws EmployeeException{
        log.info("getting details of {}", companyId);
        CompanyEntity companyEntity = null;
        try {
            companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            CompanyUtils.unmaskCompanyProperties(companyEntity, request);
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(companyEntity), HttpStatus.OK);
    }
    @Override
    public ResponseEntity<?> updateCompanyById(String companyId,  CompanyUpdateRequest companyUpdateRequest) throws EmployeeException, IOException {
        CompanyEntity user;
        try {
            user = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (user == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                        HttpStatus.BAD_REQUEST);
            }
            List<CompanyEntity> companyEntities = openSearchOperations.getCompanies();
            Map<String, Object> duplicateValuesInTheCompany = CompanyUtils.duplicateValuesInTheCompany(companyUpdateRequest, companyEntities);
            if (!duplicateValuesInTheCompany.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValuesInTheCompany),
                        HttpStatus.CONFLICT
                );
            }
            companyEntities.removeIf(company -> company.getId().equals(companyId));
            Map<String, Object> duplicateValues = CompanyUtils.duplicateUpdateValues(companyUpdateRequest, companyEntities);
            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
        } catch (Exception ex) {
            log.error("Exception while fetching user {}, {}", companyId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Entity entity = CompanyUtils.maskCompanyUpdateProperties(user, companyUpdateRequest);
        openSearchOperations.saveEntity(entity, companyId, Constants.INDEX_EMS);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateCompanyImageById(String companyId,  CompanyImageUpdate companyImageUpdate, MultipartFile multipartFile) throws EmployeeException, IOException {
        CompanyEntity user;
        try {
            user = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (user == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching user {}, {}", companyId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        CompanyEntity entity = CompanyUtils.maskCompanyImageUpdateProperties(user, companyImageUpdate, companyId);
        if (!multipartFile.isEmpty()){
            multiPartFileStore(multipartFile, entity);


        }
        openSearchOperations.saveEntity(entity, companyId, Constants.INDEX_EMS);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }
    private void multiPartFileStore(MultipartFile file, CompanyEntity company) throws IOException, EmployeeException {
        if(!file.isEmpty()){
            String filename = folderPath+company.getShortName()+"_"+file.getOriginalFilename();
            file.transferTo(new File(filename));
            company.setImageFile(company.getShortName()+"_"+file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }
    }
    @Override
    public ResponseEntity<?> deleteCompanyById(String companyId) throws EmployeeException {
        log.info("getting details of {}", companyId);
        CompanyEntity companyEntity = null;

        try {
            companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

            if (companyEntity!=null) {
                openSearchOperations.deleteEntity(companyEntity.getId(),Constants.INDEX_EMS);
                log.info("The company is:"+companyEntity.getId());

                openSearchOperations.deleteIndex(index);
                log.info("Index deleted for short name: {}", companyEntity.getShortName());
            }
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getCompanyImageById(String companyId, HttpServletRequest request) throws EmployeeException {
        log.info("getting details of {}", companyId);
        CompanyEntity companyEntity = null;
        String image = null;
        try {
            companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            String baseUrl = CompanyUtils.getBaseUrl(request);
            image = baseUrl + "var/www/ems/assets/img/" + companyEntity.getImageFile();
        } catch (Exception ex) {
            log.error("Exception while fetching company details {}", ex);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_COMPANY),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(image),
                HttpStatus.OK
        );
    }

    @Override
    public ResponseEntity<?> passwordResetForEmployee(EmployeePasswordReset employeePasswordReset, String id) throws EmployeeException {
        EmployeeEntity employee;
        String index = ResourceIdUtils.generateCompanyIndex(employeePasswordReset.getCompanyName());
        try {
            employee = openSearchOperations.getEmployeeById(id, null, index);
            if (employee == null){
                log.error("employee are not {} found", id);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_ALREADY_EXISTS), employeePasswordReset.getCompanyName()),
                        HttpStatus.CONFLICT);
            }
            byte[] decodedBytes = Base64.getDecoder().decode(employee.getPassword());
            String decodedPassword = new String(decodedBytes, StandardCharsets.UTF_8);
            if (!decodedPassword.equals(employeePasswordReset.getPassword())){
                log.debug("checking the given Password..");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_PASSWORD),
                        HttpStatus.NOT_FOUND);
            }
            String newPassword = Base64.getEncoder().encodeToString(employeePasswordReset.getNewPassword().toString().getBytes());
            employee.setPassword(newPassword);
            if (employee.getCompanyId() != null) {
                CompanyEntity companyEntity = openSearchOperations.getCompanyById(employee.getCompanyId(), null, Constants.INDEX_EMS);
                companyEntity.setPassword(newPassword);
                openSearchOperations.saveEntity(companyEntity, employee.getCompanyId(), Constants.INDEX_EMS);

            }
            openSearchOperations.saveEntity(employee, id, index);

        } catch (Exception ex) {
            log.error("Exception while fetching user {}, {}", employeePasswordReset.getCompanyName(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);

        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

}