package com.invoice.response;

import com.invoice.model.BankEntity;
import com.invoice.model.CompanyEntity;
import com.invoice.model.CustomerModel;
import com.invoice.model.InvoiceModel;
import com.invoice.request.ProductColumnsRequest;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private InvoiceModel invoice;
    private CompanyEntity company;
    private CustomerModel customer;
    private BankEntity bank;
}
