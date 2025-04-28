package com.pb.employee.persistance.model;

import com.pb.employee.request.CompanyCalendarPayload.EmployeesDayEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateEntity implements Entity {

    @Schema(example = "month")
    @NotNull(message = "{month.notnull.message}")
    @Pattern(regexp = "^\\d{2}$", message = "{invalid.month}")
    private String month;

    @Valid
    private List<HolidaysEntity> holidaysEntities;
}
