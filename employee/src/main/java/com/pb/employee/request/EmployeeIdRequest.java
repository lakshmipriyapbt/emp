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
public class EmployeeIdRequest {

    @Schema(example = "employeeId")
    @Size(min = 2, max = 20, message = "{employeeId.size.message}")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "{employeeId.format}")
    private String employeeId;
}
