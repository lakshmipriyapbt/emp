package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.request.EmployeeEducation;
import com.pb.employee.request.EmployeeExperience;
import jakarta.validation.Valid;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeePersonnelEntity implements Entity {


    @Deprecated
    private String id;
    @Deprecated
    private String employeeId;

    @Valid
    private List<EmployeeEducation> employeeEducation;

    @Valid
    private List<EmployeeExperience> employeeExperience;

    @Deprecated
    private String type;

}
