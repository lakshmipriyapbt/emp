package com.pb.employee.request;

import com.pb.employee.persistance.model.EmployeePersonnelEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeUpdateRequest {


    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "employeeType")
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+)$", message = "{employee.type}")
    @Size(min = 3, max = 20, message = "{employeeType.size.message}")
    private String employeeType;


    @Schema(example = "designationId")
    @Size(min = 2, max = 100, message = "{designation.size.message}")
    private String designation;

    @Schema(example = "departmentId")
    @Size(min = 2, max = 100, message = "{department.size.message}")
    private String department;

    @Schema(example = "location")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{location.format}")
    @Size(min = 2, max = 200, message = "{location.notnull.message}")
    private String location;

    @Schema(example = "tempAddress")
    @Pattern(regexp = "^((?!\\s)(.*?)(?<!\\s)|null|)$", message = "{tempAddress.format}")
    @Size(max = 200, message = "{tempAddress.notnull.message}")
    private String tempAddress;

    @Schema(example = "permanentAddress")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{permanentAddress.format}")
    @Size(min = 2, max = 200, message = "{permanentAddress.notnull.message}")
    private String permanentAddress;

    @Schema(example = "manager")
    @Pattern(regexp = "^(?!.*[\\s]{2})(?!.*\\s$)(?!^\\s)(?!.*\\d.*)[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*$", message = "{manager.format}")
    @Size(min = 3, max = 30, message = "{manager.notnull.message}")
    private String manager;

    @Schema(example = "mobileNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp = "^\\+91 [6-9]\\d{9}$", message = "{invalid.mobileNo}")
    private String mobileNo;

    @Schema(example = "alternateNo")
    @Pattern(regexp = "^(\\+91 [6-9]\\d{9}|null|)$", message = "{invalid.alternateNo}")
    private String alternateNo;

    @Schema(example = "maritalStatus")
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+|[A-Z][a-z]+(?: [A-Z](?:\\.? ?[A-Z])?)+)$", message = "{maritalStatus.format}")
    @Size(min = 3, max = 30, message = "{maritalStatus.notnull.message}")
    private String maritalStatus;


    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|relieved)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

    @Schema(example = "accountNo")
    @Pattern(regexp = "^\\d{9,18}$", message = "{accountno.format}")
    @NotBlank(message = "{accountNo.notnull.message}")
    private String accountNo;

    @Schema(example = "ifscCode")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "{ifscCode.format}")
    @NotBlank(message = "{ifscCode.notnull.message}")
    private String ifscCode;

    @Schema(example = "bankName")
    @Pattern(regexp = "^(?! )[A-Za-z0-9.,'&\\s-]+(?! )$", message = "{bankName.pattern.message}")
    @Size(min = 3, max = 100, message = "{bankName.size.message}")
    private String bankName;

    @Schema(example = "bankBranch")
    @Pattern(regexp =  "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*|[A-Z]+(?:\\s[A-Z]+)*)$", message = "{bankBranch.format}")
    @Size(min = 2, max = 100, message = "{bankBranch.size.message}")
    private String bankBranch;

    private String pfNo;

    @Valid
    private EmployeePersonnelEntity personnelEntity;

}