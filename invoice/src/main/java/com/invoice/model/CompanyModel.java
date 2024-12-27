package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "company")
public class CompanyModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyId;

    private String userName;
    private String companyEmail;
    private String serviceName;
    private String password;
    private String phone;
    private String companyName;
    private String pan;
    private String gstNumber;
    private String gender;
    private String stampImage;
    private String accountNumber;
    private String accountType;
    private String bankName;
    private String branch;
    private String ifscCode;
    private String address;
    private String state;
    @Column(length = 500)
    private String imageFile;
    private String place;

    private String otp;
    private Long expiryTime;
    @Column(nullable = false)
    private boolean deleted = false;

    @OneToMany(mappedBy = "companyModel", orphanRemoval = true)
    private List<InvoiceModel> invoices;
}
