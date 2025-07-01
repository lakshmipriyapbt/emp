package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import javax.annotation.Nullable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Schema(example = "firstName")
    @Pattern(regexp ="^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{firstname.format}")
    private String firstName;

    @Schema(example = "lastName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{lastname.format}")
    private String lastName;

    @Schema(example = "userType")
    @Pattern(regexp = "^(?!.*\\\\b([A-Z])\\\\s\\\\1\\\\s\\\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\\\.? ?[A-Z])? ?[A-Z][a-z]+)$|^[A-Z][a-zA-Z]*$", message = "{user.type}")
    @Size(min = 2, max = 20, message = "{userType.size.message}")
    private String userType;

    @Nullable
    @Schema(example = "departmentId")
    @Pattern(regexp = "^\\s*$|^.{2,40}$", message = "{department.size.message}")
    private String department;
}
