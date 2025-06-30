package com.pb.employee.request;

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
public class OfferLetterUpdateRequest {

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{offerDate.format}")
    @NotBlank(message = "{offerDate.notnull.message}")
    private String offerDate;

    @Schema(example = "referenceNo")
    @Pattern(regexp =  "^[A-Z0-9_\\-/]+$", message = "{referenceNo.format}")
    @Size(min = 3, max = 20, message = "{referenceNo.size.message}")
    private String referenceNo;

    @Schema(example = "employeeName")
    @Pattern(regexp = "^(?! )[A-Z][A-Za-z.,'&/()_\\s-]+(?! )$", message = "{employeeName.format}")
    @Size(min = 2, max = 100, message = "{employeeName.size.message}")
    private String employeeName;

    @Schema(example = "employeeFatherName")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{employeeFatherName.format}")
    @Size(min = 2, max = 100, message = "{employeeFatherName.size.message}")
    private String employeeFatherName;

    @Schema(example = "address")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{invalid.location.format}")
    @Size(min = 1, max = 200, message = "{location.notnull.message}")
    private String employeeAddress;

    @Schema(example = "contactNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp ="^\\+91 [6-9]\\d{9}$", message = "{invalid.mobileNo}")
    private String employeeContactNo;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{joining.format}")
    @NotBlank(message = "{joining.notnull.message}")
    private String joiningDate;

    @Schema(example = "jobLocation")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{invalid.location.format}")
    @Size(min = 1, max = 200, message = "{location.notnull.message}")
    private String jobLocation;

    @Schema(example = "salaryPackage")
    @Pattern(regexp = "^\\d{5,20}$", message = "{grossAmount.format}")
    private String salaryPackage;

    private String salaryConfigurationId;

    @Schema(example = "designation")
    @Pattern(regexp =  "^(?! )[A-Za-z0-9.,'&/()_\\s-]+(?! )$",
            message = "{invalid.position.format}")
    private String designation;

    @Schema(example = "department")
    @Pattern(regexp =  "^(?! )[A-Za-z0-9.,'&/()_\\s-]+(?! )$", message = "{department.format}")
    private String department;

}
