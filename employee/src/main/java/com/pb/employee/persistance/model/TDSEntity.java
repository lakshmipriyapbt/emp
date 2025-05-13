package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TDSEntity extends AbstractEntity {

    private String companyId;
    private String startYear;
    private String endYear;
    private String tdsType;
    private List<TDSPercentageEntity> persentageEntityList;
}
