package com.pb.employee.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeExperience {

    private String companyName;

    private String positionOrTitle;
    private String startDate;
    private String endDate;

}
