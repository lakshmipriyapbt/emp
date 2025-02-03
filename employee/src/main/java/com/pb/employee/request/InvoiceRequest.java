package com.pb.employee.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "{customerName.notnull.message}")
    private String customerName;

    @NotNull(message = "{purchaseOrder.notnull.message}")
    private String purchaseOrder;

    @NotNull(message = "{vendorCode.notnull.message}")
    private String vendorCode;

    @NotNull(message = "{invoiceDate.notnull.message}")
    private String invoiceDate;

    @NotNull(message = "{dueDate.notnull.message}")
    private String dueDate;

    @NotNull(message = "{Product.Details.notnull.message}")
    @Size(min = 1, message = "{Product.Details.size.message}")
    private List<OrderRequest> orderRequests;

    private String status;
}
