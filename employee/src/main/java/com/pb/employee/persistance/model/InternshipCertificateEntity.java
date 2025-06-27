package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InternshipCertificateEntity extends AbstractEntity {

    private String companyId;
    private String date;
    private String employeeName;
    private String department;
    private String startDate;
    private String endDate;
    private String designation;

}
