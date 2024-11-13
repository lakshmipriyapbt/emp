package com.pb.employee.request;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {

    @Schema(example = "companyName")
    @Size(min = 2, max = 100, message = "{size.message}")
    @Pattern(regexp ="^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+)$", message = "{companyname.message}")
    private String companyName;

    @Schema(example = "emailId")
    @NotNull(message = "{emailId.notnull.message}")
    @Pattern(regexp =  "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    private String emailId;

    @Schema(example = "password")
    @NotNull(message = "{password.notnull.message}")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?!.* ).{6,16}$", message = "{invalid.password}")
    private String password;

    @Schema(example = "companyAddress")
    @Size(min = 2, max = 200, message = "{companyAddress.notnull.message}")
    @Pattern(regexp = "^([A-Z][a-z]*[\\x20\\x2D\\x2F\\x2C\\x2E\\x3A\\x3B\\x27\\x22\\x28\\x29\\x5B\\x5D\\x7B\\x7D\\x2A\\x5F\\x40\\x23\\x24\\x25\\x5C\\x21\\x60\\x7E]*)*$",
            message = "{companyAddress.pattern.message}")
    private String companyAddress;

    @Schema(example = "companyRegNo")
    @Pattern(regexp = "^(|null|(L|U)\\d{5}[A-Z]{2}\\d{4}[A-Z]{3}\\d{6}$)", message = "{companyRegNo.pattern.message}")
    private String companyRegNo;

    @Schema(example = "mobileNo")
    @NotNull(message = "{mobileNo.notnull.message}")
    @Pattern(regexp ="^(?!([0-9])\\1{9})\\d{10,15}$", message = "{invalid.mobileNo}")
    private String mobileNo;

    @Schema(example = "alternateNo")
    @Pattern(regexp = "^((?!([0-9])\\1{9})\\d{10,15}|null|0|)$", message = "{invalid.alternateNo}")
    private String alternateNo;

    @Schema(example = "12ABCDE3456Z1")
    @NotNull(message = "{gstNo.notnull.message}")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9]Z[0-9A-Z]$", message = "{invalid.gstNo}")
    private String gstNo;

    @Schema(example = "panNo")
    @NotNull(message = "{panNo.notnull.message}")
    @Pattern(regexp = "^[A-Z]{5}\\d{4}[A-Z]$", message = "{invalid.panNo}")
    private String panNo;

    @Schema(example = "name")
    @Size(min = 3, max = 35, message = "{name.notnull.message}")
    @Pattern(regexp = "^(?!.*\\b([A-Z])\\s\\1\\s\\1)(?:[A-Z][a-z]+(?: [A-Z][a-z]+)*|[A-Z](?:\\.? ?[A-Z])? ?[A-Z][a-z]+|[A-Z][a-z]+(?: [A-Z](?:\\.? ?[A-Z])?)+)$", message = "{name.message}")
    private String name;

    @Schema(example = "personalMailId")
    @NotNull(message = "{personalMailId.notnull.message}")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.emailId}")
    private String personalMailId;

    @Schema(example = "personalMobileNo")
    @NotNull(message = "{personalMobileNo.notnull.message}")
    @Pattern(regexp = "^(?!([0-9])\\1{9})\\d{10,15}$", message = "{invalid.mobileNo}")
    private String personalMobileNo;

    @Schema(example = "address")
    @Pattern(regexp = "^([A-Z][a-z]*[\\x20\\x2D\\x2F\\x2C\\x2E\\x3A\\x3B\\x27\\x22\\x28\\x29\\x5B\\x5D\\x7B\\x7D\\x2A\\x5F\\x40\\x23\\x24\\x25\\x5C\\x21\\x60\\x7E]*)*$",
            message = "{address.pattern.message}")
    @Size(min = 10, max = 300, message = "{address.notnull.message}")
    private String address;

    private String imageFile;

    @Schema(example = "companyType")
    @Pattern(regexp = "^(?!\\s)(?!.*\\s$)[a-zA-Z0-9\\s,'#,&*()^\\-/]*$", message = "{companyType.pattern.message}")
    private String companyType;

    @Schema(example = "cinNo")
    @Pattern(regexp = "^(|null|(L|U)\\d{5}[A-Z]{2}\\d{4}[A-Z]{3}\\d{6}$)", message = "{invalid.cinNo}")
    private String cinNo;


    private Integer pfPercentage;
    private Integer travelAllowance;
    private Integer specialAllowance;
    private Integer hraPercentage;

    private String companyBranch;

    @Schema(example = "shortName")
    @Pattern(regexp = "^[a-z]+$", message = "{company.shortname.message}")
    @Size(min = 2, max = 30, message = "{shortName.notnull.message}")
    private String shortName;
}