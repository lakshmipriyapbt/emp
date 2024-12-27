package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "quotation")
public class QuotationModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quotationId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate quotationDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate shippingDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;

    private String vendorCode;
    private String shippingAddress;
    private String deliveryAddress;
    private BigDecimal totalAmount;
    private String gst;
    private String cGst;
    private String sGst;
    private String iGst;
    private String grandTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerId")
    private CustomerModel customer;

    @OneToMany(mappedBy = "quotationModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationOrderModel> orderModels;
}
