package com.invoice.request;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "{customerName.notnull.message}")
    @Size(min = 2, max = 100, message = "{customerName.size.message}")
    private String customerName;

    @NotBlank(message = "{email.notnull.message}")
    @Email(message = "{email.message}")
    private String email;

    @NotBlank(message = "{mobileNumber.notnull.message}")
    @Pattern(regexp = "^(\\+\\d{1,3}[- ]?)?\\d{10,15}$", message = "{mobileNumber.format}")
    private String mobileNumber;

    @NotBlank(message = "{address.notnull.message}")
    @Size(max = 255, message = "{address.size.message}")
    private String address;

    @NotBlank(message = "{state.notnull.message}")
    private String state;

    @NotBlank(message = "{city.notnull.message}")
    private String city;

    @NotBlank(message = "{pinCode.notnull.message}")
    @Pattern(regexp = "^[A-Za-z0-9 \\-]{3,10}$", message = "{pinCode.format}")
    private String pinCode;


    @Nullable
    private String gstNo;

    @Nullable
    private String stateCode;

    @NotBlank(message = "{customerCompany.notnull.message}")
    @Size(min = 2, max = 100, message = "{customerCompany.size.message}")
    private String customerCompany;
}

