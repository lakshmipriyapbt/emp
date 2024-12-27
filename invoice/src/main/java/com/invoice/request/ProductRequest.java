package com.invoice.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "{productName.notnull.message}")
    @Size(min = 2, max = 100, message = "{productName.size.message}")
    private String productName;

    @NotNull(message = "{productCost.notnull.message}")
    @Positive(message = "{productCost.type}")
    private String productCost;

    @NotBlank(message = "{hsnNo.notnull.message}")
    @Pattern(regexp = "^\\d{6}$", message = "{hsnNo.format}")
    private String hsnNo;

    @NotNull(message = "{gst.notnull.message}")
    @DecimalMin(value = "0", message = "{gst.type}")
    @DecimalMax(value = "100", message = "{gst.size}")
    private String gst;

    @NotBlank(message = "{service.notnull.message}")
    @Size(min = 2, max = 100, message = "{service.size.message}")
    private String service;

}
