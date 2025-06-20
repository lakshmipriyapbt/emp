package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.EmployeeDocumentEntity;

import java.util.Collection;
import java.util.Optional;

public interface EmployeeDocumentDao extends Dao<EmployeeDocumentEntity> {

    default Class<EmployeeDocumentEntity> getEntityClass() {
        return EmployeeDocumentEntity.class;
    }

    Optional<EmployeeDocumentEntity> getByCandidateId(String candidateId, String companyName);

}
