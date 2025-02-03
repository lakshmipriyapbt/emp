package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
public class BankUtils {


    public static BankEntity maskCompanyBankProperties(BankRequest bankRequest, String resourceId, String companyId) {
        // Declare masked variables
        String accountNumber = null, ifscCode = null, address = null,
                accountType = null,branch =null,bankName =null,state=null;

        // Masking bank details
        if (bankRequest.getAccountNumber() != null) {
            accountNumber = Base64.getEncoder().encodeToString(bankRequest.getAccountNumber().getBytes());
        }
        if (bankRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(bankRequest.getIfscCode().getBytes());
        }
        if (bankRequest.getAddress() != null) {
            address = Base64.getEncoder().encodeToString(bankRequest.getAddress().getBytes());
        }
        if (bankRequest.getBranch() != null) {
            // Masking the branch name as an example
            branch = Base64.getEncoder().encodeToString(bankRequest.getBranch().getBytes());
        }
        if (bankRequest.getAccountType() != null) {
            // Masking the branch name as an example
            accountType = Base64.getEncoder().encodeToString(bankRequest.getAccountType().getBytes());
        }

        if (bankRequest.getBankName() != null) {
            // Masking the state information
            bankName = Base64.getEncoder().encodeToString(bankRequest.getBankName().getBytes());
        }
        ObjectMapper objectMapper = new ObjectMapper();

        BankEntity bankEntity = objectMapper.convertValue(bankRequest, BankEntity.class);
        bankEntity.setBankId(resourceId); // Set the resource ID
        bankEntity.setCompanyId(companyId); // Associate with the company
        bankEntity.setAccountNumber(accountNumber); // Set the masked account number
        bankEntity.setIfscCode(ifscCode); // Set the masked IFSC code
        bankEntity.setBranch(branch); // Set the masked IFSC code
        bankEntity.setBankName(bankName); // Set the masked IFSC code
        bankEntity.setAccountType(accountType); // Set the masked IFSC code
        bankEntity.setAddress(address); // Set the masked address (or branch/state if needed)
        bankEntity.setType(Constants.BANK); // Assuming the type is "BANK"

        // Add any other fields that need masking and setting...

        return bankEntity;
    }


    public static Entity maskCompanyBankUpdateProperties(BankUpdateRequest bankUpdateRequest, String bankId, String companyId) {

        // Declare masked variables
        String  ifscCode = null, address = null, accountType = null,branch =null;

        if (bankUpdateRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(bankUpdateRequest.getIfscCode().getBytes());
        }
        if (bankUpdateRequest.getAddress() != null) {
            address = Base64.getEncoder().encodeToString(bankUpdateRequest.getAddress().getBytes());
        }
        if (bankUpdateRequest.getBranch() != null) {
            // Masking the branch name as an example
            branch = Base64.getEncoder().encodeToString(bankUpdateRequest.getBranch().getBytes());
        }
        if (bankUpdateRequest.getAccountType() != null) {
            // Masking the branch name as an example
            accountType = Base64.getEncoder().encodeToString(bankUpdateRequest.getAccountType().getBytes());
        }

        ObjectMapper objectMapper = new ObjectMapper();

        BankEntity bankEntity = objectMapper.convertValue(bankUpdateRequest, BankEntity.class);
        bankEntity.setIfscCode(ifscCode); // Set the masked IFSC code
        bankEntity.setBranch(branch); // Set the masked IFSC code
        bankEntity.setAccountType(accountType); // Set the masked IFSC code
        bankEntity.setAddress(address); // Set the masked address (or branch/state if needed)
        bankEntity.setType(Constants.BANK); // Assuming the type is "BANK"

        // Add any other fields that need masking and setting...

        return bankEntity;
    }

    public static BankEntity unmaskBankProperties(BankEntity bankEntity) {
        // Declare unmasked variables
            String accountNumber = null, accountType = null, bankName = null,
                    branch = null, ifscCode = null, address = null;

            // Unmasking the properties by decoding the Base64 encoded values
            if (bankEntity.getAccountNumber() != null) {
                accountNumber = new String(Base64.getDecoder().decode(bankEntity.getAccountNumber()));
            }
            if (bankEntity.getAccountType() != null) {
                accountType = new String(Base64.getDecoder().decode(bankEntity.getAccountType()));
            }
            if (bankEntity.getBankName() != null) {
                bankName = new String(Base64.getDecoder().decode(bankEntity.getBankName()));
            }
            if (bankEntity.getBranch() != null) {
                branch = new String(Base64.getDecoder().decode(bankEntity.getBranch()));
            }
            if (bankEntity.getIfscCode() != null) {
                ifscCode = new String(Base64.getDecoder().decode(bankEntity.getIfscCode()));
            }
            if (bankEntity.getAddress() != null) {
                address = new String(Base64.getDecoder().decode(bankEntity.getAddress()));
            }

            // Now, set the unmasked properties back to the BankEntity object
        bankEntity.setAccountNumber(accountNumber);
        bankEntity.setAccountType(accountType);
        bankEntity.setBankName(bankName);
        bankEntity.setBranch(branch);
        bankEntity.setIfscCode(ifscCode);
        bankEntity.setAddress(address);

            return bankEntity;
    }

}