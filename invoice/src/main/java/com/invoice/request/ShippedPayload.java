package com.invoice.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippedPayload {

    private String customerName;
    private String address;
    private String mobileNumber;
}
