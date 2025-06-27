package com.pb.employee.request;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.employee.persistance.model.Entity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class OfferLetterRequest {


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

    private String companyId;
    private String salaryConfigurationId;

    @Schema(example = "designation")
    @Pattern(regexp =  "^(?! )[A-Za-z0-9.,'&/()_\\s-]+(?! )$",
            message = "{invalid.position.format}")
    private String designation;

    @Schema(example = "department")
    @Pattern(regexp =  "^(?! )[A-Za-z0-9.,'&/()_\\s-]+(?! )$", message = "{department.format}")
    private String department;

    @Schema(example = "Intern Name")
    @NotBlank(message = "Intern name cannot be blank")
    private String internName;

    @Schema(example = "intern@example.com")
    @Pattern(regexp = "^\\S+@\\S+\\.\\S+$", message = "Invalid intern email format")
    private String internEmail;

    @Schema(example = "+91 9876543210")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "Invalid mobile number format")
    private String mobileNo;

    @Schema(example = "HR Name")
    @NotBlank(message = "HR name cannot be blank")
    private String hrName;

    @Schema(example = "hr@example.com")
    @Pattern(regexp = "^\\S+@\\S+\\.\\S+$", message = "Invalid HR email format")
    private String hrEmail;

    @Schema(example = "+91 9123456789")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "Invalid HR mobile number format")
    private String hrMobileNo;

    @Schema(example = "true")
    private boolean draft;

}