package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.BankRequest;
import com.pb.employee.request.BankUpdateRequest;
import com.pb.employee.service.BankService;
import com.pb.employee.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BankServiceImpl implements BankService {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> bankDetailsToCompany(String companyId, BankRequest bankRequest, HttpServletRequest request) throws IOException, EmployeeException {
        CompanyEntity companyEntity;
        Entity bankEntity = null;

        // Step 1: Validate if the company exists in the database
        log.debug("Validating Company Exists or not {}", companyId);
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);

        if (companyEntity == null) {
            log.error("CompanyId not exists: {}", companyId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                    HttpStatus.NOT_FOUND);
        }
        // Step 2: Unmask sensitive company properties from the request if needed
        CompanyUtils.unmaskCompanyProperties(companyEntity, request);
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

        // Step 4.1: Generate a unique resource ID for the bank using companyId and bankName
        String resourceId = ResourceIdUtils.generateBankResourceId(companyId,bankRequest.getAccountNumber());

        // Step 4.2: Check for inter-list duplicates (against the database)
        BankEntity dbBankRecords = openSearchOperations.getBankById(index,null,resourceId);  // Fetch bank records from the DB

        if (dbBankRecords != null) {
            log.error("Bank Details already exist: {}", resourceId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.BANK_ALREADY_EXISTS),
                    HttpStatus.CONFLICT);
        }
        List<BankEntity> bankEntities = openSearchOperations.getBankDetailsOfCompany(index);
        Map<String, Object> duplicateValuesInTheBank = BankUtils.duplicateValuesInBank(bankRequest,bankEntities);
        if (!duplicateValuesInTheBank.isEmpty()) {
            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().failureResponse(duplicateValuesInTheBank),
                    HttpStatus.CONFLICT
            );
        }
        // Step 4.3: Mask and prepare the bank entity
        bankEntity = BankUtils.maskCompanyBankProperties(bankRequest, resourceId, companyId);
        try {
          // Step 4.4: Save the bank details to the generated index for each bank entry
           openSearchOperations.saveEntity(bankEntity, resourceId, index);
           log.info("Successfully saved bank details for companyId: {}", companyId);
        } catch (Exception exception) {
           log.error("Error while saving bank details for companyId {}: {}", companyId, exception.getMessage());
           throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_BANK_DETAILS),
             HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Step 5: Return success response after saving all bank details
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getAllBanksByCompanyId(String companyId) throws EmployeeException,IOException {
        CompanyEntity companyEntity=null;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS); // Adjust this call as needed

        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }
        List<BankEntity> bankEntities = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            bankEntities = openSearchOperations.getBankDetailsOfCompany(index);
            for(BankEntity bankEntity : bankEntities) {
                BankUtils.unmaskBankProperties(bankEntity);
            }

        } catch (Exception ex) {
            log.error("Exception while fetching Bank Details for company {}: {}", companyId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BANK_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (bankEntities == null || bankEntities.size()<=0){
            log.error("Banks details are Not found");
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BANK_DETAILS)),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(bankEntities), HttpStatus.OK);
    }


    @Override
    public ResponseEntity<?> getBankDetailsById(String companyId, String bankId) throws EmployeeException,IOException {
        log.info("getting details of {}", bankId);
        BankEntity entity = null;
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS); // Adjust this call as needed

        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            entity = openSearchOperations.getBankById(index, null,bankId);
            if (entity == null) {
                log.error("Bank with ID {} not found", bankId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BANK_DETAILS), companyId),
                        HttpStatus.NOT_FOUND);
            }
            BankUtils.unmaskBankProperties(entity);

        } catch (Exception ex) {
            log.error("Exception while fetching bank details {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BANK_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (entity == null){
            log.error("Bank Details with id {} is not found", bankId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BANK_DETAILS), bankId),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);
    }


    @Override
    public ResponseEntity<?> updateBankById(String companyId, String bankId, BankUpdateRequest bankUpdateRequest) throws EmployeeException, IOException {
        // Fetch the company entity by companyId
        CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);

        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }

        log.info("Getting details of bank with ID {}", bankId);
        BankEntity bankEntity;
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());

        try {
            // Fetch the bank details by bankId
            bankEntity = openSearchOperations.getBankById(index, null, bankId);
            if (bankEntity == null) {
                log.error("Unable to find the Bank details with ID {}", bankId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BANK_DETAILS),
                        HttpStatus.NOT_FOUND);
            }
            int noOfChanges = BankUtils.noChangeInValuesOfBank(bankEntity,bankUpdateRequest);
            if (noOfChanges==0){
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGE_IN_BANK_DETAILS)))),
                        HttpStatus.CONFLICT);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching bank details: {}", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BANK_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Process and mask sensitive bank details before saving
        Entity entity = BankUtils.maskCompanyBankUpdateProperties(bankUpdateRequest, bankEntity,bankId, companyId);
        // Save the updated bank details back to OpenSearch
        openSearchOperations.saveEntity(entity, bankId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK
        );
    }

    @Override
    public ResponseEntity<?> deleteBankById(String companyId, String bankId) throws EmployeeException,IOException {
        log.info("getting details of {} :", bankId);
        Object entity = null;
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS); // Adjust this call as needed
        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_COMPANY), companyId),
                    HttpStatus.NOT_FOUND);
        }
        String index = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        try {
            entity = openSearchOperations.getById(bankId, null, index);
            if (entity!=null) {
                openSearchOperations.deleteEntity(bankId,index);
            } else {
                log.error("unable to find bank Details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_BANK_DETAILS),
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching bank details {} : ", ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_BANK_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getBankList() throws EmployeeException {
        log.info("Fetching bank details");

        try {
            ObjectMapper mapper = new ObjectMapper();
            Resource resource = new ClassPathResource(Constants.BANK_JSON);
            InputStream inputStream = resource.getInputStream();

            Map<String, String> bankMap = mapper.readValue(inputStream, new TypeReference<>() {});
            List<BankListAPIEntity> banks = new ArrayList<>();
            bankMap.forEach((code, name) -> banks.add(new BankListAPIEntity(code, name)));

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(banks), HttpStatus.OK);

        } catch (Exception e) {
            log.error("Exception while reading bank list: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_BANK_DETAILS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}