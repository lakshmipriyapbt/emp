package com.pb.employee.request.CompanyCalendarPayload;

import com.pb.employee.persistance.model.DateEntity;
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
public class CompanyCalendarRequest {

    @Schema(example = "2025")
    @NotNull(message = "{year.notnull.message}")
    @Pattern(regexp = "^\\d{4}$", message = "{invalid.year}")
    private String year;


    @Valid
    private List<DateEntity> dateEntityList;

}
