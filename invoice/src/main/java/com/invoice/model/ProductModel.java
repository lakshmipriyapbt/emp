package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Data
@Table(name = "product")
public class ProductModel {

    @Id
    private String productId;

    private String productName;
    private String productCost;
    private String service;
    private String hsnNo;
    private String gst;
    private String unitCost;
    private String companyId;
  
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderModel> orderModels;
}
