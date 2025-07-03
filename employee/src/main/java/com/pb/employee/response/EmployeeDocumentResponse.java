package com.pb.employee.response;

import com.pb.employee.persistance.model.DocumentEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDocumentResponse {
    private String id;
    private String candidateId;
    private String folderPath;
    private List<DocumentEntity> documentEntities;
}
