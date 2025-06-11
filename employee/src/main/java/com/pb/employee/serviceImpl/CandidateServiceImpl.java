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

            Collection<CandidateEntity> candidates = candidateDao.getCandidates(candidateRequest.getCompanyName(), null,companyId );

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
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request)+candidateRequest.getCompanyName()+Constants.SLASH+Constants.LOGIN ;
                log.info("The company url : "+companyUrl);
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
   public Collection<CandidateEntity> getCandidate(String companyName, String candidateId)
           throws EmployeeException, IOException{
       try {
           CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
           if (companyEntity == null){
               log.error("Exception while fetching the company calendar details");
               throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
           }
           log.debug("Getting Company Calendar by companyName: {}", companyName);
           return candidateDao.getCandidates(companyName, candidateId, companyEntity.getId());
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
   }

    @Override
    public ResponseEntity<?> updateCandidate(String companyName, String candidateId, CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException {
        try {
            log.debug("Validating candidate existence for id {} in company {}", candidateId, companyName);
            CandidateEntity existingCandidate = null;
            DepartmentEntity departmentEntity = null;
            String index = ResourceIdUtils.generateCompanyIndex(companyName);

            try {
                // Company validation
                CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
                if (companyEntity == null) {
                    log.error("Company not found: {}", companyName);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
                }

                existingCandidate = candidateDao.get(candidateId, companyName).orElse(null);
                if (existingCandidate == null) {
                    log.error("Candidate not found with ID {} in company {}", candidateId, companyName);
                    throw new RuntimeException();
                }
            } catch (EmployeeException e) {
                log.error("Unable to fetch candidate with id {}", candidateId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), candidateId), HttpStatus.NOT_FOUND);
            }

            try {
                if (candidateUpdateRequest.getDepartment() != null) {
                    departmentEntity = openSearchOperations.getDepartmentById(candidateUpdateRequest.getDepartment(), null, index);
                    if (departmentEntity == null) {
                        log.error("Department not found: {}", candidateUpdateRequest.getDepartment());
                        throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT), HttpStatus.CONFLICT);
                    }
                }

                if ((candidateUpdateRequest.getFirstName() == null || candidateUpdateRequest.getFirstName().equals(existingCandidate.getFirstName()))
                        && (candidateUpdateRequest.getLastName() == null || candidateUpdateRequest.getLastName().equals(existingCandidate.getLastName()))
                        && Objects.equals(candidateUpdateRequest.getDepartment(), existingCandidate.getDepartment())) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE), HttpStatus.BAD_REQUEST);
                }

                CandidateEntity updatedData = objectMapper.convertValue(candidateUpdateRequest, CandidateEntity.class);
                BeanUtils.copyProperties(updatedData, existingCandidate, getNullPropertyNames(updatedData));
                candidateDao.save(existingCandidate, companyName);
            } catch (EmployeeException ex) {
                throw ex;
            } catch (Exception e) {
                log.error("Unable to update candidate with id {} due to {}", candidateId, e.getMessage());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_CANDIDATE), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (EmployeeException e) {
            throw e;
        } catch (Exception e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
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
