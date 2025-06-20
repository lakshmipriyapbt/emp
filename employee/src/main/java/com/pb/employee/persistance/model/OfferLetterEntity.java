package com.pb.employee.persistance.model;

import com.pb.employee.opensearch.OpenSearchOperations;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import nonapi.io.github.classgraph.json.Id;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.annotation.Id;



@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OfferLetterEntity implements Entity {
    @Autowired
    private OpenSearchOperations openSearchOperations;

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

    private String internName;
    private String internEmail;
    private String mobileNo;

    private String hrName;
    private String hrEmail;
    private String hrMobileNo;



}
