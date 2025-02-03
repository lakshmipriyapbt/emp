package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "invoice")
public class InvoiceModel {

    @Id
    private String invoiceId;

    private String purchaseOrder;
    private String vendorCode;
    private String invoiceDate;

    @OneToMany(mappedBy = "invoiceModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderModel> orderModels;

    private String customerId;
    private String gst;
    private String cGst;
    private String sGst;
    private String iGst;
    private String totalAmount;
    private String grandTotal;
    private String dueDate;
    private String grandTotalInWords;
    private String status;
    private String companyId;
}