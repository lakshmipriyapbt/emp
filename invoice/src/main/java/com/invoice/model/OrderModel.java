package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice_order")
public class OrderModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;
    private String quantity;
    private String cost;
    private BigDecimal totalCost;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "invoiceId")
    private InvoiceModel invoiceModel;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductModel product;
}
