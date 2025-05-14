package com.pb.employee.persistance.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TDSPercentageEntity {

    @Schema(example = "MinValue")
    @Pattern(regexp = "^\\d{1,13}(\\.\\d{1,2})?$",  message = "{invalid.minValue}")
    private String min;

    @Schema(example = "MaxValue")
    @Pattern(regexp = "^\\d{1,13}(\\.\\d{1,2})?$", message =  "{invalid.maxValue}")
    private String max;

    @Schema(example = "taxPercentage")
    @Pattern(regexp = "^(100|[0-9]{1,2})$", message =  "{invalid.taxPercentage}")
    private String taxPercentage;
}
