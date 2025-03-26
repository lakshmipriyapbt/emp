package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEducation {

    @Schema(example = "educationLevel")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{educationLevel.pattern.message}")
    @Size(max = 100, min = 2, message = "{educationLevel.notnull.message}")
    private String educationLevel;

    @Schema(example = "instituteName")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{instituteName.pattern.message}")
    @Size(max = 100, min = 2, message = "{instituteName.notnull.message}")
    private String instituteName;

    @Schema(example = "boardOfStudy")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{boardOfStudy.pattern.message}")
    @Size(max = 100, min = 2, message = "{boardOfStudy.notnull.message}")
    private String boardOfStudy;

    @Schema(example = "branch")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{branch.pattern.message}")
    @Size(max = 100, min = 2, message = "{branch.notnull.message}")
    private String branch;

    @Schema(example = "2025")
    @Pattern(regexp = "^(19|20)\\d{2}$", message = "{year.pattern.message}")
    private String year;

    @Schema(example = "73.9")
    @Pattern(regexp = "^([1-9]?[0-9]|100)(\\.\\d)?$", message = "{percentage.pattern.message}")
    private String percentage;


}
