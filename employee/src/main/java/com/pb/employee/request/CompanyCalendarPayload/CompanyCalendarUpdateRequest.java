package com.pb.employee.request.CompanyCalendarPayload;

import com.pb.employee.persistance.model.DateEntity;
import jakarta.validation.Valid;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyCalendarUpdateRequest {

    @Valid
    private List<DateEntity> dateEntityList;
}
