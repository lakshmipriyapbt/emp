package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeeDocumentEntity extends AbstractEntity{

    private String id;
    private String companyName;
    private String referenceId;
    private String folderPath;
   private List<DocumentEntity> documentEntities;
}
