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
public class DepartmentRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "department")
    @Pattern(regexp = "^([A-Z](?:[a-z]+|\\b)(?:\\s[A-Z](?:[a-z]+|\\b))|[A-Z])*$", message = "{department.format}")
    @Size(min = 2, max = 20, message = "{department.size.message}")
    private String name;
}