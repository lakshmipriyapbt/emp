package com.pb.employee.persistance.model;

import lombok.*;
import nonapi.io.github.classgraph.json.Id;
import org.springframework.data.annotation.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferLetterEntity extends Entity {

    @Id
    private String id; // Optional: useful for OpenSearch or MongoDB

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

    private String createdDate;
}
