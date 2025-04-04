package com.pb.employee.request;

import com.pb.employee.config.ValidDateRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidDateRange
public class EmployeeExperience {

    @Schema(example = "companyName")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{companyName.pattern.message}")
    @Size(max = 100, min = 2, message = "{companyName.notnull.message}")
    private String companyName;

    @Schema(example = "positionOrTitle")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&/()_\\s-]+(?! )$", message = "{positionOrTitle.pattern.message}")
    @Size(max = 50, min = 2, message = "{positionOrTitle.notnull.message}")
    private String positionOrTitle;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{startDate.format}")
    @NotBlank(message = "{startDate.notnull.message}")
    private String startDate;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{endDate.format}")
    @NotBlank(message = "{endDate.notnull.message}")
    private String endDate;

}
