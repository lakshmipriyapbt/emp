package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Quotation_order")
public class QuotationOrderModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;

    private String quantity;
    private String cost;
    private String totalCost;

    @ManyToOne
    @JoinColumn(name = "quotationId")
    private QuotationModel quotationModel;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductModel product;
}
