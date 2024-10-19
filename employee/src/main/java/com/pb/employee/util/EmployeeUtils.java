package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.sql.Struct;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class EmployeeUtils {


    public static Entity maskEmployeeProperties(EmployeeRequest employeeRequest,String resourceId, String companyId) {
        String uan = null, pan = null, adharId = null, accountNo=null, ifscCode = null,password=null, mobileNo=null;
        if(employeeRequest.getPanNo() != null) {
            pan = Base64.getEncoder().encodeToString(employeeRequest.getPanNo().getBytes());
        }
        if(employeeRequest.getPassword() != null) {
            password = Base64.getEncoder().encodeToString(employeeRequest.getPassword().getBytes());
        }
        if(employeeRequest.getUanNo() != null) {
            uan = Base64.getEncoder().encodeToString(employeeRequest.getUanNo().getBytes());
        }
        if(employeeRequest.getAadhaarId() != null) {
            adharId = Base64.getEncoder().encodeToString(employeeRequest.getAadhaarId().getBytes());
        }
        if(employeeRequest.getIfscCode() != null) {
            ifscCode = Base64.getEncoder().encodeToString(employeeRequest.getIfscCode().getBytes());
        }
        if(employeeRequest.getAccountNo() != null) {
            accountNo = Base64.getEncoder().encodeToString(employeeRequest.getAccountNo().getBytes());
        }
        if(employeeRequest.getMobileNo() != null) {
            mobileNo = Base64.getEncoder().encodeToString(employeeRequest.getMobileNo().getBytes());
        }
        ObjectMapper objectMapper = new ObjectMapper();

        EmployeeEntity entity = objectMapper.convertValue(employeeRequest, EmployeeEntity.class);
        entity.setId(resourceId);
        entity.setCompanyId(companyId);
        entity.setPassword(password);
        entity.setAadhaarId(adharId);
        entity.setPanNo(pan);
        entity.setUanNo(uan);
        entity.setIfscCode(ifscCode);
        entity.setAccountNo(accountNo);
        entity.setMobileNo(mobileNo);
        entity.setType(Constants.EMPLOYEE);
        return entity;
    }


    public static Entity unmaskEmployeeProperties(EmployeeEntity employeeEntity, DepartmentEntity entity, DesignationEntity designationEntity) {
        String pan = null,uanNo=null,aadhaarId=null,accountNo=null,ifscCode=null, mobileNo=null;
        if(employeeEntity.getPanNo() != null) {
            pan = new String((Base64.getDecoder().decode(employeeEntity.getPanNo().toString().getBytes())));
        }
        if(employeeEntity.getUanNo() != null) {
            uanNo = new String((Base64.getDecoder().decode(employeeEntity.getUanNo().toString().getBytes())));
        }
        if(employeeEntity.getAadhaarId() != null) {
            aadhaarId = new String((Base64.getDecoder().decode(employeeEntity.getAadhaarId().toString().getBytes())));
        }
        if(employeeEntity.getAccountNo() != null) {
            accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
        }
        if(employeeEntity.getIfscCode() != null) {
            ifscCode = new String((Base64.getDecoder().decode(employeeEntity.getIfscCode().toString().getBytes())));
        }
        if(employeeEntity.getMobileNo() != null) {
            mobileNo = new String((Base64.getDecoder().decode(employeeEntity.getMobileNo().toString().getBytes())));
        }
        if (entity != null && employeeEntity.getDepartment() != null) {
            employeeEntity.setDepartmentName(entity.getName());
        }else {
            employeeEntity.setDepartmentName(null);
        }
        if (designationEntity != null && employeeEntity.getDesignation() != null) {
            employeeEntity.setDesignationName(designationEntity.getName());
        }else {
            employeeEntity.setDesignationName(null);
        }
        employeeEntity.setIfscCode(ifscCode);
        employeeEntity.setAccountNo(accountNo);
        employeeEntity.setAadhaarId(aadhaarId);
        employeeEntity.setUanNo(uanNo);
        employeeEntity.setPassword("**********");
        employeeEntity.setPanNo(pan);
        employeeEntity.setMobileNo(mobileNo);
        return employeeEntity;
    }

    public static Map<String, Object> duplicateValues(EmployeeRequest employeeRequest, List<EmployeeEntity> employees) throws EmployeeException {
        Map<String, Object> responseBody = new HashMap<>();

            for (EmployeeEntity employeeEntity : employees) {
                String employeeId = null, aadhaarId = null, panNo = null, uanNo = null, accountNo = null, mobileNo=null;
                if (employeeEntity.getEmployeeId() != null && employeeEntity.getEmployeeId().equals(employeeRequest.getEmployeeId())) {
                    responseBody.put(Constants.DUPLICATE_EMPLOYEE_ID, employeeRequest.getEmployeeId());

                }
                if (employeeEntity.getAadhaarId()!=null) {
                    aadhaarId = new String((Base64.getDecoder().decode(employeeEntity.getAadhaarId().toString().getBytes())));
                    if (aadhaarId.equals(employeeRequest.getAadhaarId())) {
                        responseBody.put(Constants.DUPLICATE_AADHAAR_ID, employeeRequest.getAadhaarId());
                    }
                }
                if (employeeEntity.getMobileNo()!=null) {
                    mobileNo = new String((Base64.getDecoder().decode(employeeEntity.getMobileNo().toString().getBytes())));
                    if (mobileNo.equals(employeeRequest.getMobileNo())) {
                        responseBody.put(Constants.DUPLICATE_MOBILE_NO, employeeRequest.getMobileNo());
                    }
                }
                if (employeeEntity.getPanNo() != null) {
                    panNo = new String((Base64.getDecoder().decode(employeeEntity.getPanNo().toString().getBytes())));
                    if (panNo.equals(employeeRequest.getPanNo())) {
                        responseBody.put(Constants.DUPLICATE_PAN_NO, employeeRequest.getPanNo());
                    }
                }
                if (employeeEntity.getUanNo() != null) {
                    uanNo = new String((Base64.getDecoder().decode(employeeEntity.getUanNo().toString().getBytes())));
                    if (uanNo.equals(employeeRequest.getUanNo()) && !uanNo.isEmpty()) {
                        responseBody.put(Constants.DUPLICATE_UAN_NO, employeeRequest.getUanNo());
                    }
                }
                if (employeeEntity.getAccountNo() != null) {
                    accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
                    if (accountNo.equals(employeeRequest.getAccountNo())) {
                        responseBody.put(Constants.DUPLICATE_ACCOUNT_NO, employeeRequest.getAccountNo());
                    }
                }


            }

        return responseBody;
    }
    public static Map<String, Object> duplicateUpdateValues(EmployeeUpdateRequest employeeUpdateRequest, List<EmployeeEntity> employees) throws EmployeeException {
        Map<String, Object> responseBody = new HashMap<>();
         // Iterate through the list to check for duplicates
            for (EmployeeEntity employeeEntity : employees) {
                String accountNo = null;
                if (employeeEntity.getAccountNo() != null) {
                    accountNo = new String((Base64.getDecoder().decode(employeeEntity.getAccountNo().toString().getBytes())));
                    if (accountNo.equals(employeeUpdateRequest.getAccountNo())) {
                        responseBody.put(Constants.DUPLICATE_ACCOUNT_NO, employeeUpdateRequest.getAccountNo());
                    }
                }
            }

        return responseBody;
    }

    public static int duplicateEmployeeProperties(EmployeeEntity user, EmployeeUpdateRequest employeeUpdateRequest) {
        int noOfChanges = 0;
        String type=null, email=null;
        if (!user.getEmployeeType().equals(employeeUpdateRequest.getEmployeeType())){
            noOfChanges+=1;
        }
        if (!user.getDesignation().equals(employeeUpdateRequest.getDesignation())){
            noOfChanges +=1;
        }
        if (!user.getDepartment().equals(employeeUpdateRequest.getDepartment())){
            noOfChanges +=1;
        }
        if (!user.getLocation().equals(employeeUpdateRequest.getLocation())){
            noOfChanges +=1;
        }if (!user.getManager().equals(employeeUpdateRequest.getManager())){
            noOfChanges +=1;
        }if (!user.getMobileNo().isEmpty()) {
            String mobile = new String(Base64.getDecoder().decode(user.getMobileNo().getBytes()));
            if (!mobile.equals(employeeUpdateRequest.getMobileNo())) {
                noOfChanges += 1;
            }
        }if (!user.getStatus().equals(employeeUpdateRequest.getStatus())){
            noOfChanges +=1;
        }if (!user.getIfscCode().isEmpty()) {
           String ifsc = new String((Base64.getDecoder().decode(user.getIfscCode().toString().getBytes())));

            if (!ifsc.equals(employeeUpdateRequest.getIfscCode())) {
                noOfChanges += 1;
            }
        }if (!user.getAccountNo().isEmpty()) {
            String account = new String(Base64.getDecoder().decode(user.getAccountNo().toString().getBytes()));
            if (!account.equals(employeeUpdateRequest.getAccountNo())) {
                noOfChanges += 1;
            }
        }if (!user.getBankName().equals(employeeUpdateRequest.getBankName())){
            noOfChanges +=1;
        }
        return noOfChanges;
    }
    public static EmployeeSalaryEntity unMaskEmployeeSalaryProperties(EmployeeSalaryEntity salaryEntity) {

        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null,spa=null;
        String te= null, pfE = null, pfEmployer =null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        if(salaryEntity.getFixedAmount() != null) {
            fix = new String((Base64.getDecoder().decode(salaryEntity.getFixedAmount().toString().getBytes())));
            salaryEntity.setFixedAmount(fix);
        }

        if(salaryEntity.getVariableAmount() != null) {
            var = new String(Base64.getDecoder().decode(salaryEntity.getVariableAmount().toString().getBytes()));
            salaryEntity.setVariableAmount(var);
        }
        if(salaryEntity.getGrossAmount() != null) {
            gross = new String((Base64.getDecoder().decode(salaryEntity.getGrossAmount().toString().getBytes())));
            salaryEntity.setGrossAmount(gross);
        }

        if(salaryEntity.getTotalEarnings() != null) {
            te = new String((Base64.getDecoder().decode(salaryEntity.getTotalEarnings().toString().getBytes())));
            salaryEntity.setTotalEarnings(te);
        }
        if(salaryEntity.getTotalDeductions() != null) {
            tded = new String((Base64.getDecoder().decode(salaryEntity.getTotalDeductions().toString().getBytes())));
            salaryEntity.setTotalDeductions(tded);
        }

        if(salaryEntity.getPfTax() != null) {
            tax = new String((Base64.getDecoder().decode(salaryEntity.getPfTax().toString().getBytes())));
            salaryEntity.setPfTax(tax);
        }
        if (salaryEntity.getIncomeTax() != null){
            itax = new String((Base64.getDecoder().decode(salaryEntity.getIncomeTax().toString().getBytes())));
            salaryEntity.setIncomeTax(itax);
        }

        if(salaryEntity.getNetSalary() != null) {
            net = new String((Base64.getDecoder().decode(salaryEntity.getNetSalary().toString().getBytes())));
            salaryEntity.setNetSalary(net);
        }
        if(salaryEntity.getTotalTax() != null) {
            ttax = new String((Base64.getDecoder().decode(salaryEntity.getTotalTax().toString().getBytes())));
            salaryEntity.setTotalTax(ttax);
        }

        if (salaryEntity.getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getAllowances().entrySet()) {
                decodedAllowances.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryEntity.getSalaryConfigurationEntity().setAllowances(decodedAllowances); // Update the original object
        }

        if (salaryEntity.getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();
            for (Map.Entry<String, String> entry : salaryEntity.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                decodedDeductions.put(entry.getKey(), unMaskValue(entry.getValue()));
            }
            salaryEntity.getSalaryConfigurationEntity().setDeductions(decodedDeductions); // Update the original object
        }
        salaryEntity.setType(Constants.SALARY);
        return salaryEntity;
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }

    public static int duplicateCompanyProperties(CompanyEntity user, CompanyUpdateRequest companyUpdateRequest) {
        int noOfChanges = 0;
        if(!user.getCompanyAddress().equals(companyUpdateRequest.getCompanyAddress())){
           noOfChanges +=1;
        }
        if (user.getMobileNo() !=null){
           String mobileNo = new String(Base64.getDecoder().decode(user.getMobileNo()));
           if (!mobileNo.equals(companyUpdateRequest.getMobileNo())){
            noOfChanges +=1;
           }
        }
        if (user.getAlternateNo() !=null){
           String alternate = new String(Base64.getDecoder().decode(user.getAlternateNo()));
           if (!alternate.equals(companyUpdateRequest.getAlternateNo())){
                noOfChanges +=1;
           }
        }

        if(!user.getName().equals(companyUpdateRequest.getName())){
            noOfChanges +=1;
        }
        if (user.getPersonalMobileNo() !=null){
            String prMobileNo = new String(Base64.getDecoder().decode(user.getPersonalMobileNo()));
            if (!prMobileNo.equals(companyUpdateRequest.getPersonalMobileNo())){
                noOfChanges +=1;
            }
        }
        if (user.getPersonalMailId() !=null){
            String prMailId = new String(Base64.getDecoder().decode(user.getPersonalMailId()));
            if (!prMailId.equals(companyUpdateRequest.getPersonalMailId())){
                noOfChanges +=1;
            }
        }
        if(!user.getAddress().equals(companyUpdateRequest.getAddress())){
            noOfChanges +=1;
        }
        if(!user.getCompanyType().equals(companyUpdateRequest.getCompanyType())){
            noOfChanges +=1;
        }

    return noOfChanges;
    }

}