package com.pb.employee.persistance.model;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankListAPIEntity {

    private String bankCode;
    private String bankName;
}
