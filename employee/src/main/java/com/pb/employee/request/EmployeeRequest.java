package com.pb.employee.request;


import com.pb.employee.config.ValidAge;
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
@ValidAge // <-- Apply the custom validation here
public class EmployeeRequest {

    @Schema(example = "companyShortName")
    @Pattern(regexp = "^[a-z]+$", message = "{companyName.format}")
    @NotBlank(message = "{companyname.message}")
    @Size(min = 2, max = 30, message = "{size.message}")
    private String companyName;

    @Schema(example = "employeeType")
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+)$", message = "{employee.type}")
    @Size(min = 3, max = 20, message = "{employeeType.size.message}")
    private String employeeType;

    @Schema(example = "employeeId")
    @Size(min = 2, max = 20, message = "{employeeId.size.message}")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "{employeeId.format}")
    private String employeeId;

    @Schema(example = "firstName")
    @Pattern(regexp ="^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+|[A-Z][a-z]+(?: [A-Z](?:\\.? ?[A-Z])?)+)$", message = "{firstname.format}")
    @Size(min = 3, max = 20, message = "{firstName.size.message}")
    private String firstName;

    @Schema(example = "lastName")
    @Pattern(regexp = "^([A-Z]|[A-Z][a-z]*|[a-z]|)$", message = "{lastname.format}")
    private String lastName;

    @Schema(example = "emailId")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    @NotBlank(message = "{emailId.notnull.message}")
    private String emailId;// "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"

    @Schema(example = "password")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?!.* ).{6,16}$", message = "{invalid.password}")
    @NotBlank(message = "{password.notnull.message}")
    private String password;

    @Schema(example = "designationId")
    @Size(min = 2, max = 100, message = "{designation.size.message}")
    private String designation;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{dateOfHiring.format}")
    @NotBlank(message = "{dateOfHiring.notnull.message}")
    private String dateOfHiring;

    @Schema(example = "yyyy-mm-dd")
    @Pattern(regexp =  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$", message = "{dateOfBirth.format}")
    @NotBlank(message = "{dateOfBirth.notnull.message}")
    private String dateOfBirth;

    @Schema(example = "departmentId")
    @Size(min = 2, max = 100, message = "{department.size.message}")
    private String department;

    @Schema(example = "location")
    @Pattern(regexp = "^(?!\\d+$)(?!^[A-Za-z]+$)(?!^[A-Za-z]+\\s*,?\\s*[A-Za-z]+$)(?:(?:[A-Z][a-z]*)(?:\\s+[A-Z][a-z0-9]*)*(?:[\\s,./'-]+[A-Za-z0-9]+)*(?:\\s*,\\s*[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,\\s*[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)?)?$", message = "{location.format}")
    @Size(min = 2, max = 200, message = "{location.notnull.message}")
    private String location;

    @Schema(example = "manager")
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+|[A-Z][a-z]+(?: [A-Z](?:\\.? ?[A-Z])?)+)$", message = "{manager.format}")
    @Size(min = 3, max = 30, message = "{manager.notnull.message}")
    private String manager;

    @Schema(example = "mobileNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp = "^\\d{10}$", message = "{invalid.mobileNo}")
    private String mobileNo;

    @Schema(example = "Active")
    @Pattern(regexp = "^(Active|InActive)$", message = "{status.format}")
    @NotBlank(message = "{status.notnull.message}")
    private String status;

    @Schema(example = "panNo")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "{invalid.panNo}")
    @NotBlank(message = "{panNo.notnull.message}")
    private String panNo;

    @Schema(example = "uanNo")
    @Pattern(regexp = "^\\d{12}$", message = "{invalid.uanNo}")
    @NotBlank(message = "{uanNo.notnull.message}")
    private String uanNo;

    @Schema(example = "aadhaarId")
    @Pattern(regexp = "^\\d{12}$", message = "{invalid.aadhaarId}")
    @NotBlank(message = "{aadhaarId.notnull.message}")
    private String aadhaarId;

    @Schema(example = "accountNo")
    @Pattern(regexp = "^\\d{9,18}$", message = "{accountNo.format}")
    @NotBlank(message = "{accountNo.notnull.message}")
    private String accountNo;

    @Schema(example = "ifscCode")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "{ifscCode.format}")
    @NotBlank(message = "{ifscCode.notnull.message}")
    private String ifscCode;

    @Schema(example = "bankName")
    @Pattern(regexp = "^(?:[A-Z]{2,}(?:\\s[A-Z][a-z]+)*|(?:[A-Z][a-z]+(?:\\s[A-Z][a-z]+)*))$", message = "{bankName.format}")
    @Size(min = 3, max = 100, message = "{bankName.size.message}")
    private String bankName;

}