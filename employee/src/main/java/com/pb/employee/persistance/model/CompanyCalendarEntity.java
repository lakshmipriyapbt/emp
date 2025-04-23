package com.pb.employee.persistance.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyCalendarEntity extends AbstractEntity {

    private String companyId;
    private String year;
    private List<DateEntity> dateEntityList;

}
