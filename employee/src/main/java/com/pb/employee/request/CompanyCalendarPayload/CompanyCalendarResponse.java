package com.pb.employee.request.CompanyCalendarPayload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pb.employee.persistance.model.DateEntity;
import com.pb.employee.persistance.model.HolidaysEntity;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@SuperBuilder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyCalendarResponse {

    @JsonProperty("id")
    private String id;

    @JsonProperty("companyId")
    private String companyId;

    @JsonProperty("year")
    private String year;

    private String month;
    private List<HolidaysEntity> holidaysEntities;
    private List<EmployeesDayEntity> employeesDayEntities;


}
