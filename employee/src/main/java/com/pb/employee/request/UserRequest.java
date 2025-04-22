package com.pb.employee.request;

import com.pb.employee.config.ValidAge;
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
public class UserRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "firstName")
    @Pattern(regexp ="^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{firstname.format}")
    private String firstName;

    @Schema(example = "lastName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{lastname.format}")
    private String lastName;

    @Schema(example = "emailId")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    @NotBlank(message = "{emailId.notnull.message}")
    private String emailId;

    @Schema(example = "userType")
    @Pattern(regexp = "^(?!.*\\\\b([A-Z])\\\\s\\\\1\\\\s\\\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\\\.? ?[A-Z])? ?[A-Z][a-z]+)$|^[A-Z][a-zA-Z]*$", message = "{user.type}")
    @Size(min = 3, max = 20, message = "{userType.size.message}")
    private String userType;

    @Schema(example = "departmentId")
    @Size(min = 2, max = 100, message = "{department.size.message}")
    private String department;

}
