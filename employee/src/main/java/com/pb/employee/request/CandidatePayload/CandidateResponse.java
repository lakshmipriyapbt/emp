package com.pb.employee.request.CandidatePayload;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidateResponse {
    private String id;
    private String candidateType;
    private String companyId;
    private String candidateId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String password;
    private String designation;
    private String designationName;
    private String dateOfHiring;
    private String department;
    private String departmentName;
    private String currentGross;
    private String location;
    private String tempAddress;
    private String permanentAddress;
    private String manager;
    private String mobileNo;
    private String alternateNo;
    private String maritalStatus;
    private List<String> roles;
    private String status;
    private String panNo;
    private String uanNo;
    private String pfNo;
    private String aadhaarId;
    private String dateOfBirth;
    private String accountNo;
    private String ifscCode;
    private String bankName;
    private String bankBranch;

}
