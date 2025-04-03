package com.pb.employee.request;

import io.micrometer.common.lang.Nullable;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class InternshipOfferLetterRequest {

    private String companyId;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String date;

    @Schema(example = "employeeName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$",
            message = "{firstname.format}")
    @Size(min = 3, max = 20, message = "{firstName.size.message}")
    private String employeeName;

    @NotBlank(message = "{address.notnull.message}")
    @Size(max = 255, message = "{address.size.message}")
    private String address;

    @Schema(example = "department")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&/\\s-]+(?! )$",
            message = "{department.format}")
    @Size(min = 1, max = 40, message = "{department.size.message}")
    private String department;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String startDate;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String endDate;

    @Schema(example = "designation")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{designation.format}")
    @Size(min = 1, max = 40, message = "{designation.size.message}")
    private String designation;

    @Schema(example = "associateName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$",
            message = "{name.format}")
    @Size(min = 3, max = 20, message = "{Name.size.message}")
    private String associateName;

    @Schema(example = "designation")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$",
            message = "{designation.format}")
    @Size(min = 1, max = 40, message = "{designation.size.message}")
    private String associateDesignation;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{date.format}")
    @NotBlank(message = "{date.notnull.message}")
    private String acceptDate;

    @Nullable // Spring annotation to mark it as nullable
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "{stipend.format}")
    private String stipend;

    @Schema(example = "employeeName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$",
            message = "{firstname.format}")
    @Size(min = 3, max = 20, message = "{firstName.size.message}")
    private String hrName;

    @Schema(example = "emailId")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{hr.invalid.emailId}")
    @NotBlank(message = "{hr.emailId.notnull.message}")
    private String hrEmail;

    @Schema(example = "emailId")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    @NotBlank(message = "{emailId.notnull.message}")
    private String internEmail;

    @Schema(example = "mobileNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "{invalid.mobileNo}")
    private String mobileNo;

    @Schema(example = "mobileNo")
    @NotNull(message = "{hr.mobileNo.notnull.message}")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "{hr.invalid.mobileNo}")
    private String hrMobileNo;

    @Schema(example = "companyBranch")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{companyBranch.pattern.message}")
    @Size(max = 100, min = 2, message = "{companyBranch.notnull.message}")
    private String companyBranch;

}
