package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppraisalEntity extends AbstractEntity {

    private String employeeId;
    private String companyId;
    private String SalaryConfigurationId;
    private String date;
    private String dateOfSalaryIncrement;
    private String grossCompensation;
    private String salaryHikePersentage;
    private boolean draft;
}
