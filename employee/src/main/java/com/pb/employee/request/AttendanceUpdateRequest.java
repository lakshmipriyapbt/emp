package com.pb.employee.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceUpdateRequest {

    @Schema(example = "month")
    @NotNull(message = "{month.notnull.message}")
    @Pattern(regexp = "^[A-Z][a-z]*$", message = "{invalid.month}")
    private String month;

    @Schema(example = "year")
    @NotNull(message = "{year.notnull.message}")
    @Pattern(regexp = "^\\d+$", message = "{invalid.year}")
    private String year;


    @Schema(example = "totalWorkingDays")
    @NotNull(message = "{notnull.message}")
    @DecimalMax(value = "31", message = "{total.working.days}")
    @Digits(integer = 9, fraction = 0, message = "{total.working.days}")
    private String totalWorkingDays;

    @Schema(example = "noOfWorkingDays")
    @NotNull(message = "{noOfWorkingDays.notnull.message}")
    @DecimalMax(value = "31", message = "{no.of.working.days}")
    @Digits(integer = 9, fraction = 0, message = "{no.of.working.days}")
    private String noOfWorkingDays;
}