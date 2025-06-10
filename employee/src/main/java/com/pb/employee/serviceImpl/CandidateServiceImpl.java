package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import com.pb.employee.request.CandidatePayload.CandidateResponse;
import com.pb.employee.request.CandidatePayload.CandidateUpdateRequest;
import com.pb.employee.response.UserResponse;
import com.pb.employee.service.CandidateService;
import com.pb.employee.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Service
@Slf4j
public class CandidateServiceImpl implements CandidateService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private EmailUtils emailUtils;

    @Override
    public ResponseEntity<?> registerCandidate(CandidateRequest candidateRequest, HttpServletRequest request) throws EmployeeException , IOException{
        String defaultPassword;
        log.debug("validating name {} candidate Id {} exsited ", candidateRequest.getLastName(), candidateRequest.getCandidateId());
        String resourceId = ResourceIdUtils.generateCandidateResourceId(candidateRequest.getEmailId());
        Object entity = null;
        String index = ResourceIdUtils.generateCompanyIndex(candidateRequest.getCompanyName());
        try{
            entity = openSearchOperations.getById(resourceId, null, index);
            if(entity != null) {
                log.error("Candidate details existed{}", candidateRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_EMAILID_ALREADY_EXISTS), candidateRequest.getEmailId()),
                        HttpStatus.CONFLICT);
            }

            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, candidateRequest.getCompanyName());

            if (shortNameEntity == null || shortNameEntity.isEmpty()) {
                log.error("Company not found with name {}", candidateRequest.getCompanyName());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            String companyId = shortNameEntity.getFirst().getId();

            Collection<CandidateEntity> candidates = candidateDao.getCandidates(candidateRequest.getCompanyName(), null, null,companyId );

            Map<String, Object> duplicateValues = CandidateUtils.duplicateValues(candidateRequest, List.copyOf(candidates));

            if (!duplicateValues.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().failureResponse(duplicateValues),
                        HttpStatus.CONFLICT
                );
            }
        } catch (IOException e) {
            log.error("Unable to get the company details {}", candidateRequest.getCompanyName());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_CANDIDATE), candidateRequest.getEmailId()),
                    HttpStatus.BAD_REQUEST);
        }
        List<EmployeeEntity> employeeByData = openSearchOperations.getCompanyEmployeeByData(candidateRequest.getCompanyName(), candidateRequest.getCandidateId(),
                candidateRequest.getEmailId());
        if(employeeByData !=null && employeeByData.size() > 0) {
            log.error("Candidate with emailId {} already existed", candidateRequest.getCandidateId());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_ID_ALREADY_EXISTS), candidateRequest.getCandidateId()),
                    HttpStatus.CONFLICT);
        }
        try{
            DepartmentEntity departmentEntity =null;
            DesignationEntity designationEntity = null;
            departmentEntity = openSearchOperations.getDepartmentById(candidateRequest.getDepartment(), null, index);
            if (departmentEntity == null){

            }
            designationEntity = openSearchOperations.getDesignationById(candidateRequest.getDesignation(), null, index);
            if (designationEntity == null){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                        HttpStatus.CONFLICT);
            }
            List<CompanyEntity> shortNameEntity = openSearchOperations.getCompanyByData(null, Constants.COMPANY, candidateRequest.getCompanyName());

            defaultPassword = PasswordUtils.generateStrongPassword();
            Entity companyEntity = CandidateUtils.maskCandidateProperties(candidateRequest, resourceId, shortNameEntity.getFirst().getId(),defaultPassword);
            Entity result = openSearchOperations.saveEntity(companyEntity, resourceId, index);

        } catch (Exception exception) {
            log.error("Unable to save the candidate details {} {}", candidateRequest.getEmailId(),exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_CANDIDATE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Send the email with company details
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request)+candidateRequest.getCompanyName()+Constants.SLASH+Constants.LOGIN ;
                log.info("The company url : "+companyUrl);// Example URL
                emailUtils.sendRegistrationEmail(candidateRequest.getEmailId(), companyUrl,Constants.CANDIDATE,defaultPassword);
            } catch (Exception e) {
                log.error("Error sending email to candidate: {}", candidateRequest.getEmailId());
                throw new RuntimeException(e);
            }
        });

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);

    }

    @Override
    public ResponseEntity<CandidateResponse> getCandidateById(String companyName, String candidateId) throws EmployeeException, IOException {
        log.info("Fetching candidate for companyName: {} and candidateId: {}", companyName, candidateId);

        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<CompanyEntity> companyEntities = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyName);

        if (companyEntities == null || companyEntities.isEmpty()) {
            log.error("Company not found with name {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }

        String companyId = companyEntities.getFirst().getId();
        CandidateEntity candidate = candidateDao.getCandidateById(companyName, candidateId, companyId);

        if (candidate == null) {
            log.error("Candidate with ID {} not found for company {}", candidateId, companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }

        CandidateResponse response = objectMapper.convertValue(candidate, CandidateResponse.class);
        return ResponseEntity.ok(response);

    }


    @Override
    public ResponseEntity<List<CandidateResponse>> getCandidates(String companyName) throws IOException, EmployeeException {
        log.info("Fetching all candidates for companyName: {}", companyName);

        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        List<CompanyEntity> companyEntities = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyName);

        if (companyEntities == null || companyEntities.isEmpty()) {
            log.error("Company not found with name {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }

        String companyId = companyEntities.getFirst().getId();
        Collection<CandidateEntity> candidates = candidateDao.getCandidates(companyName, null, null, companyId);

        List<CandidateResponse> candidateResponses = candidates.stream()
                .map(candidate -> objectMapper.convertValue(candidate, CandidateResponse.class))
                .toList();

        return new ResponseEntity<>(candidateResponses, HttpStatus.OK);

    }

    @Override
    public ResponseEntity<?> updateCandidate(String companyName, String candidateId, CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException {
        String index = null;
        DepartmentEntity departmentEntity = null;
        try {
            index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            CandidateEntity existingCandidate = candidateDao.getCandidateById(companyName, candidateId, companyEntity.getId());
            if (existingCandidate == null) {
                log.error("Candidate not found with ID {} in company {}", candidateId, companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), candidateId), HttpStatus.NOT_FOUND);
            }

            if (candidateUpdateRequest.getDepartment() != null) {
                departmentEntity = openSearchOperations.getDepartmentById(candidateUpdateRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", candidateUpdateRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build()
                                    .createFailureResponse(new Exception(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT))),
                            HttpStatus.CONFLICT);
                }
            }

            if ((candidateUpdateRequest.getFirstName() == null || candidateUpdateRequest.getFirstName().equals(existingCandidate.getFirstName()))
                    && (candidateUpdateRequest.getLastName() == null || candidateUpdateRequest.getLastName().equals(existingCandidate.getLastName()))
                    && Objects.equals(candidateUpdateRequest.getDepartment(), existingCandidate.getDepartment())
                    && (candidateUpdateRequest.getEmailId() == null || candidateUpdateRequest.getEmailId().equals(existingCandidate.getEmailId()))) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE), HttpStatus.BAD_REQUEST);
            }

            CandidateEntity updatedData = objectMapper.convertValue(candidateUpdateRequest, CandidateEntity.class);
            BeanUtils.copyProperties(updatedData, existingCandidate, getNullPropertyNames(updatedData));

            candidateDao.save(existingCandidate, companyName);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                    HttpStatus.OK);

        } catch (EmployeeException e) {
            log.error("Error during candidate update: {}", e.getMessage());
            throw e;
        } catch (Exception ex) {
            log.error("Unexpected error during candidate update: {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_CANDIDATE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteCandidateById(String companyName, String candidateId) throws EmployeeException, IOException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found while attempting to delete candidate: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            CandidateEntity existingCandidate = candidateDao.getCandidateById(companyName, candidateId, companyEntity.getId());

            if (existingCandidate == null) {
                log.error("Candidate with ID {} not found in company {}", candidateId, companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), candidateId), HttpStatus.NOT_FOUND);
            }

            candidateDao.delete(candidateId, companyName);
            log.info("Successfully deleted candidate with ID {} from company {}", candidateId, companyName);

        } catch (EmployeeException employeeException) {
            log.error("Error during candidate deletion: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting candidate with ID {}: {}", candidateId, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_CANDIDATE), candidateId),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    public String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        return Stream.of(src.getPropertyDescriptors())
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }

}
