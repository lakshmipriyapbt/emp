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
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+)$", message = "{department.format}")
    @Size(min = 2, max = 20, message = "{department.size.message}")
    private String name;
}