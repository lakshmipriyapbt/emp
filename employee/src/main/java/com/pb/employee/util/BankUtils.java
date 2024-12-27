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
        bankEntity.setId(resourceId); // Set the resource ID
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

    public static void unmaskBankProperties(BankEntity bankEntityDb) {
        ObjectMapper objectMapper = new ObjectMapper();

        BankEntity bankEntity = objectMapper.convertValue(bankEntityDb,BankEntity.class);

        // Unmask the sensitive fields by decoding them from Base64
            if (bankEntity.getAccountNumber() != null) {
                String decodedAccountNumber = decodeBase64(bankEntity.getAccountNumber());
                bankEntity.setAccountNumber(decodedAccountNumber);
            }

            if (bankEntity.getIfscCode() != null) {
                String decodedIfscCode = decodeBase64(bankEntity.getIfscCode());
                bankEntity.setIfscCode(decodedIfscCode);
            }

            if (bankEntity.getAddress() != null) {
                String decodedAddress = decodeBase64(bankEntity.getAddress());
                bankEntity.setAddress(decodedAddress);
            }

            if (bankEntity.getAccountType() != null) {
                String decodedAccountType = decodeBase64(bankEntity.getAccountType());
                bankEntity.setAccountType(decodedAccountType);
            }

            if (bankEntity.getBranch() != null) {
                String decodedBranch = decodeBase64(bankEntity.getBranch());
                bankEntity.setBranch(decodedBranch);
            }

            if (bankEntity.getBankName() != null) {
                String decodedBankName = decodeBase64(bankEntity.getBankName());
                bankEntity.setBankName(decodedBankName);
            }
    }

    private static String decodeBase64(String encodedString) {
        try {
            // Decode the Base64 encoded string
            byte[] decodedBytes = Base64.getDecoder().decode(encodedString);
            return new String(decodedBytes); // Return decoded string
        } catch (IllegalArgumentException e) {
            // Handle invalid Base64 string if needed (e.g., logging, returning empty string, etc.)
            return null;
        }
    }

}