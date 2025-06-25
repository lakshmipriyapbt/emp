package com.pb.employee.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeWithCandidateRequest extends EmployeeRequest  {

    private String candidateId;

}
