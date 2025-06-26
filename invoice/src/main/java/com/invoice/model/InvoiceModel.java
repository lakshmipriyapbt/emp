package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.invoice.request.ProductColumnsRequest;
import com.invoice.request.ShippedPayload;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InvoiceModel implements Entity{

    @Id
    private String invoiceId;
    private String companyId;
    private String customerId;
    private String bankId;

    private String vendorCode;
    private String purchaseOrder;
    private String invoiceDate;
    private String dueDate;
    private String invoiceNo;
    private String subTotal;
    private String cGst;
    private String sGst;
    private String iGst;
    private String grandTotal;
    private String grandTotalInWords;
    private String notes;

    private List<Map<String,  String>> productData;
    private List<ProductColumnsRequest> productColumns;
    private ShippedPayload shippedPayload;
    private String status;
    private String type;

    private String salesPerson;
    private String shippingMethod;
    private String shippingTerms;
    private String paymentTerms;
    private String deliveryDate;
}