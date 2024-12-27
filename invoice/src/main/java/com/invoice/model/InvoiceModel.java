package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerId")
    private CustomerModel customer;

    private String purchaseOrder;
    private String vendorCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate invoiceDate;

    @JsonManagedReference
    @OneToMany(mappedBy = "invoiceModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderModel> orderModels;

    private BigDecimal totalAmount;
    private String status;
    private String gst;
    private String cGst;
    private String sGst;
    private String iGst;
    private String grandTotal;
    private String dueDate;
    private String grandTotalInWords;

    @ManyToOne
    @JoinColumn(name = "companyId")
    private CompanyModel companyModel;
}
