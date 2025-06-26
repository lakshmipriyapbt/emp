package com.invoice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateEntity implements Entity  {

    private String id;
    private String companyId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String invoiceTemplateNo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;
}
