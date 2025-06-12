package com.pb.employee.request.TDSPayload;

import com.pb.employee.persistance.model.TDSPercentageEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TDSUpdatePayload {

    @Schema(example = "standardDeduction")
    @Pattern(regexp = "^\\d{1,13}$", message = "{invalid.standardDeduction}")
    private String standardDeduction;

    @Valid
    private List<TDSPercentageEntity> persentageEntityList;
}
