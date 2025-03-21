package com.pb.employee.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEducation {

    private String educationLevel;
    private String instituteName;
    private String boardOfStudy;
    private String branch;
    private String year;
    private String persentage;


}
