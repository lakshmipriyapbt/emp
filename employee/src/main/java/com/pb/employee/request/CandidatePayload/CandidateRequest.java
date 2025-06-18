package com.pb.employee.request.CandidatePayload;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateRequest {

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
    private String emailId;// "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{dateOfHiring.format}")
    @NotBlank(message = "{dateOfHiring.notnull.message}")
    private String dateOfHiring;

    @Schema(example = "mobileNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "{invalid.mobileNo}")
    private String mobileNo;

    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

}