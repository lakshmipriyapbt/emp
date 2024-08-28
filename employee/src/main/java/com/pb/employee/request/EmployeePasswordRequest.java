package com.pb.employee.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class EmployeePasswordRequest {

    private String username;
    private String company;
}
