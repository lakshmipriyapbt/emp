package com.invoice.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class QuotationRequest {

    @NotNull(message = "{customerName.notnull.message}")
    private String customerName;

    @NotBlank(message = "Vendor code is required.")
    @Size(max = 50, message = "Vendor code must not exceed 50 characters.")
    private String vendorCode;

    @NotNull(message = "Quotation date is required.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate quotationDate;

    @NotNull(message = "Due date is required.")
    @FutureOrPresent(message = "Due date must be today or in the future.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @FutureOrPresent(message = "Shipping date must be today or in the future.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate shippingDate;

    @Future(message = "Delivery date must be in the future.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;

    @NotBlank(message = "Shipping address is required.")
    @Size(max = 255, message = "Shipping address must not exceed 255 characters.")
    private String shippingAddress;

    @NotBlank(message = "Delivery address is required.")
    @Size(max = 255, message = "Delivery address must not exceed 255 characters.")
    private String deliveryAddress;

    @NotNull(message = "{Product.Details.notnull.message}")
    @Size(min = 1, message = "{Product.Details.size.message}")
    private List<OrderRequest> orderRequests;
}
