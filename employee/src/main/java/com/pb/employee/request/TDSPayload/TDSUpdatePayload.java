package com.pb.employee.request.TDSPayload;

import com.pb.employee.persistance.model.TDSPercentageEntity;
import jakarta.validation.Valid;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TDSUpdatePayload {

    @Valid
    private List<TDSPercentageEntity> persentageEntityList;
}
