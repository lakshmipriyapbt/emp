package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;



import java.util.Base64;

@Slf4j
@Component
public class CandidateUtils {

    public static Entity maskCandidateProperties(CandidateRequest candidateRequest, String resourceId, String companyId, String defaultPassword) {
        String uan = null, pan = null, adharId = null, accountNo=null, ifscCode = null,password=null, mobileNo=null, altNo= null ;
        if(candidateRequest.getPanNo() != null) {
            pan = Base64.getEncoder().encodeToString(candidateRequest.getPanNo().getBytes());
        }
//        if(employeeRequest.getPassword() != null) {
//            password = Base64.getEncoder().encodeToString(employeeRequest.getPassword().getBytes());
//        }
        if(candidateRequest.getUanNo() != null) {
            uan = Base64.getEncoder().encodeToString(candidateRequest.getUanNo().getBytes());
        }
        if(candidateRequest.getAadhaarId() != null) {
            adharId = Base64.getEncoder().encodeToString(candidateRequest.getAadhaarId().getBytes());
        }
        if(candidateRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(candidateRequest.getIfscCode().getBytes());
        }
        if(candidateRequest.getAccountNo() != null) {
            accountNo = Base64.getEncoder().encodeToString(candidateRequest.getAccountNo().getBytes());
        }
        if(candidateRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(candidateRequest.getMobileNo().getBytes());
        }
        if(candidateRequest.getAlternateNo() != null) {
            altNo = Base64.getEncoder().encodeToString(candidateRequest.getAlternateNo().getBytes());
        }
        // Encode default password
        password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());

        ObjectMapper objectMapper = new ObjectMapper();

        CandidateEntity entity = objectMapper.convertValue(candidateRequest, CandidateEntity.class);
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setCandidateId(candidateRequest.getCandidateId());
        entity.setPassword(password);
        entity.setAadhaarId(adharId);
        entity.setPanNo(pan);
        entity.setUanNo(uan);
        entity.setIfscCode(ifscCode);
        entity.setAccountNo(accountNo);
        entity.setMobileNo(mobileNo);
        entity.setAlternateNo(altNo);
        entity.setType(Constants.CANDIDATE);
        return entity;
    }


    public static Entity unmaskCandidateProperties(CandidateEntity candidateEntity, DepartmentEntity entity, DesignationEntity designationEntity) {
        String pan = null,uanNo=null,aadhaarId=null,accountNo=null,ifscCode=null, mobileNo=null, alterNo=null;
        if(candidateEntity.getPanNo() != null) {
            pan = new String((Base64.getDecoder().decode(candidateEntity.getPanNo().toString().getBytes())));
        }
        if(candidateEntity.getUanNo() != null) {
            uanNo = new String((Base64.getDecoder().decode(candidateEntity.getUanNo().toString().getBytes())));
        }
        if(candidateEntity.getAadhaarId() != null) {
            aadhaarId = new String((Base64.getDecoder().decode(candidateEntity.getAadhaarId().toString().getBytes())));
        }
        if(candidateEntity.getAccountNo() != null) {
            accountNo = new String((Base64.getDecoder().decode(candidateEntity.getAccountNo().toString().getBytes())));
        }
        if(candidateEntity.getIfscCode() != null) {
            ifscCode = new String((Base64.getDecoder().decode(candidateEntity.getIfscCode().toString().getBytes())));
        }
        if(candidateEntity.getMobileNo() != null) {
            mobileNo = new String((Base64.getDecoder().decode(candidateEntity.getMobileNo().toString().getBytes())));
        }
        if(candidateEntity.getAlternateNo() != null && !candidateEntity.getAlternateNo().isEmpty()) {
            alterNo = new String((Base64.getDecoder().decode(candidateEntity.getAlternateNo().toString().getBytes())));
        }
        if (entity != null && candidateEntity.getDepartment() != null) {
            candidateEntity.setDepartmentName(entity.getName());
        }else {
            candidateEntity.setDepartmentName(null);
        }
        if (designationEntity != null && candidateEntity.getDesignation() != null) {
            candidateEntity.setDesignationName(designationEntity.getName());
        }else {
            candidateEntity.setDesignationName(null);
        }
        candidateEntity.setIfscCode(ifscCode);
        candidateEntity.setAccountNo(accountNo);
        candidateEntity.setAadhaarId(aadhaarId);
        candidateEntity.setUanNo(uanNo);
        candidateEntity.setPassword("**********");
        candidateEntity.setPanNo(pan);
        candidateEntity.setAlternateNo(alterNo);
        candidateEntity.setMobileNo(mobileNo);
        return candidateEntity;
    }

    public static Map<String, Object> duplicateValues(CandidateRequest candidateRequest, List<CandidateEntity> candidates) throws EmployeeException {
        Map<String, Object> responseBody = new HashMap<>();

        for (CandidateEntity candidateEntity : candidates) {
            String aadhaarId = null, uanNo = null, accountNo = null, mobileNo=null;
            if (candidateEntity.getCandidateId() != null && candidateEntity.getCandidateId().equals(candidateRequest.getCandidateId())) {
                responseBody.put(Constants.DUPLICATE_EMPLOYEE_ID, candidateRequest.getCandidateId());

            }
            if (candidateEntity.getAadhaarId()!=null) {
                aadhaarId = new String((Base64.getDecoder().decode(candidateEntity.getAadhaarId().toString().getBytes())));
                if (aadhaarId.equals(candidateRequest.getAadhaarId())) {
                    responseBody.put(Constants.DUPLICATE_AADHAAR_ID, candidateRequest.getAadhaarId());
                }
            }
            if (candidateEntity.getMobileNo()!=null) {
                mobileNo = new String((Base64.getDecoder().decode(candidateEntity.getMobileNo().toString().getBytes())));
                if (mobileNo.equals(candidateRequest.getMobileNo())) {
                    responseBody.put(Constants.DUPLICATE_MOBILE_NO, candidateRequest.getMobileNo());
                }
            }
            if (candidateEntity.getUanNo() != null) {
                uanNo = new String((Base64.getDecoder().decode(candidateEntity.getUanNo().toString().getBytes())));
                if (uanNo.equals(candidateRequest.getUanNo()) && !uanNo.isEmpty()) {
                    responseBody.put(Constants.DUPLICATE_UAN_NO, candidateRequest.getUanNo());
                }
            }
            if (candidateEntity.getAccountNo() != null) {
                accountNo = new String((Base64.getDecoder().decode(candidateEntity.getAccountNo().toString().getBytes())));
                if (accountNo.equals(candidateRequest.getAccountNo())) {
                    responseBody.put(Constants.DUPLICATE_ACCOUNT_NO, candidateRequest.getAccountNo());
                }
            }
        }
        return responseBody;
    }

}