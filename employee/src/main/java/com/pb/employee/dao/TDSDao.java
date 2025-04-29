package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.persistance.model.TDSEntity;
import com.pb.employee.request.TDSPayload.TDSResPayload;

import java.util.Collection;

public interface TDSDao extends Dao<TDSEntity>{

    default Class<TDSEntity> getEntityClass() {
        return TDSEntity.class;
    }

    Collection<TDSEntity> getCompanyTDS(String companyName, String id, String year, String companyId) throws EmployeeException;
}
