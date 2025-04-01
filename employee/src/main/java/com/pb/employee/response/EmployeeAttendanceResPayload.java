package com.pb.employee.response;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttendanceResPayload {


    private String firstName;
    private String lastName;
    private String employeeId;
    private String employeeCreatedId;
    private String month;
    private String year;
    private String totalWorkingDays;
    private String noOfWorkingDays;
    private String leaves;


}
