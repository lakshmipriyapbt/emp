package com.pb.employee.request.TDSPayload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pb.employee.persistance.model.TDSPercentageEntity;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@SuperBuilder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TDSResPayload {

    @JsonProperty("id")
    private String id;

    @JsonProperty("companyId")
    private String companyId;

    @JsonProperty("startYear")
    private String startYear;

    @JsonProperty("endYear")
    private String endYear;

    @JsonProperty("tdsType")
    private String tdsType;

    private List<TDSPercentageEntity> persentageEntityList;

    @JsonProperty("type")
    private String type;

}
