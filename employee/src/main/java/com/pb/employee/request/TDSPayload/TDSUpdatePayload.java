package com.pb.employee.request.TDSPayload;

import com.pb.employee.persistance.model.TDSPercentageEntity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TDSUpdatePayload {

    private List<TDSPercentageEntity> persentageEntityList;
}
