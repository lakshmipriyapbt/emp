package com.pb.employee.persistance.model;

import com.pb.employee.validations.ValidateTDSValuesRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidateTDSValuesRange
public class TDSPercentageEntity {

    @Schema(example = "MinValue")
    @Pattern(regexp = "^\\d{1,13}$", message = "{invalid.minValue}")
    private String min;

    @Schema(example = "MaxValue")
    @Pattern(regexp =  "^\\d{1,13}$", message =  "{invalid.maxValue}")
    private String max;

    @Schema(example = "taxPercentage")
    @Pattern(regexp = "^(?:[1-9]|[1-9][0-9])$", message = "{invalid.taxPercentage}")
    private String taxPercentage;

}
