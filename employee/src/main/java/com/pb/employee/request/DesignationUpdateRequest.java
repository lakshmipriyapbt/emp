package com.pb.employee.request;
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
public class DesignationUpdateRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "designation")
    @Pattern(regexp = "^[A-Z][A-Za-z]+(?:\\s[A-Z][A-Za-z]+)*$", message = "{designation.format}")
    @Size(min = 2, max = 20, message = "{designation.size.message}")
    private String name;
}
