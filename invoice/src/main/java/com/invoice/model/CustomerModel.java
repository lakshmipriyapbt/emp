package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.micrometer.common.lang.Nullable;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "customer")
public class CustomerModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String customerName;
    private String customerCompany;
    private String address;
    private String state;
    private String city;
    private String pinCode;
    @Nullable
    private String stateCode;
    @Column(unique = true)
    private String mobileNumber;
    @Column(unique = true)
    private String email;
    @Column(unique = true)
    @Nullable
    private String gstNo;

    @OneToMany(mappedBy = "customer", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<InvoiceModel> invoiceModel;

    @OneToMany(mappedBy = "customer", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<QuotationModel> quotationModel;
}
