package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeEntity implements Entity{
    private String id;
    private String employeeType;
    private String companyId;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String password;
    private String designation;
    private String dateOfHiring;
    private String department;
    private String location;
    private String manager;
    private List<String> roles;
    private int status;
    private String panNo;
    private String uanNo;
    private String dateOfBirth;
    private String accountNo;
    private String ifscCode;
    private String bankName;
    private String type;

}