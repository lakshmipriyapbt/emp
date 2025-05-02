package com.invoice.request;

import com.invoice.validations.ValidateGst;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidateGst
public class InvoiceUpdateRequest {

    private String cGst;
    private String sGst;
    private String iGst;
}
