package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.BankRequest;
import com.pb.employee.request.DepartmentRequest;
import com.pb.employee.request.DepartmentUpdateRequest;
import com.pb.employee.service.BankService;
import com.pb.employee.service.DepartmentService;
import com.pb.employee.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
        String resourceId = ResourceIdUtils.generateBankResourceId(bankRequest.getBankName(), bankRequest.getAccountNumber());

        // Step 4.2: Check for inter-list duplicates (against the database)
        BankEntity dbBankRecords = openSearchOperations.getBankById(index,null,resourceId);  // Fetch bank records from the DB

        if (dbBankRecords != null) {
            log.error("Bank Details already exist: {}", resourceId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.BANK_ALREADY_EXISTS),
                    HttpStatus.CONFLICT);
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

}