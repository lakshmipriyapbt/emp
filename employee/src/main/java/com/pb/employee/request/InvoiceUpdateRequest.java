package com.pb.employee.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceUpdateRequest {

    private String cGst;
    private String sGst;
    private String iGst;
}
