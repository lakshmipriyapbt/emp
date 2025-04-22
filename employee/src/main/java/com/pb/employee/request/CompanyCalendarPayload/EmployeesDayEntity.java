package com.pb.employee.request.CompanyCalendarPayload;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeesDayEntity {

    private String employeeName;
    private String event;
    private String theme;
    private String date;
}
