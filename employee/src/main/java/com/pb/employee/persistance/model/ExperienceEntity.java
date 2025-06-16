package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExperienceEntity extends AbstractEntity {

    private String companyName;
    private String employeeId;
    private String companyId;
    private String date;
    private String lastWorkingDate;
    private String aboutEmployee;
    private boolean draft;

}
