package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternshipCertificateEntity;

import java.util.Collection;

public interface InternshipCertificateDao extends Dao<InternshipCertificateEntity> {

    default Class<InternshipCertificateEntity> getEntityClass() {
        return InternshipCertificateEntity.class;
    }

    Collection<InternshipCertificateEntity> getInternshipCertificate(String companyName, String employeeId, String companyId ) throws EmployeeException;


}
