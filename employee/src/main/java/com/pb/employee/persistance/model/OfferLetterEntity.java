package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfferLetterEntity extends AbstractEntity {


    private String offerDate;
    private String referenceNo;
    private String employeeName;
    private String employeeFatherName;
    private String employeeAddress;
    private String employeeContactNo;
    private String joiningDate;
    private String jobLocation;
    private String salaryPackage;
    private String companyId;
    private String salaryConfigurationId;
    private String designation;
    private String department;
    private boolean draft;



}
