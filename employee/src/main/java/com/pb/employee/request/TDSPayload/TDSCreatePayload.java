package com.pb.employee.request.TDSPayload;

import com.pb.employee.validations.ValidateYearsRange;
import com.pb.employee.persistance.model.TDSPercentageEntity;
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
@ValidateYearsRange
public class TDSCreatePayload {

    @Schema(example = "2025")
    @NotNull(message = "{startYear.notnull.message}")
    @Pattern(regexp = "^\\d{4}$", message = "{invalid.startYear}")
    private String startYear;

    @Schema(example = "2025")
    @NotNull(message = "{endYear.notnull.message}")
    @Pattern(regexp = "^\\d{4}$", message = "{invalid.endYear}")
    private String endYear;

    @Schema(example = "tdsType")
    @Pattern(regexp = "^(new|old)$", message = "{tdsType.format}")
    private String tdsType;

    @Schema(example = "standardDeduction")
    @Pattern(regexp = "^\\d{1,13}$", message = "{invalid.standardDeduction}")
    private String standardDeduction;

    @Valid
    private List<TDSPercentageEntity> persentageEntityList;
}
