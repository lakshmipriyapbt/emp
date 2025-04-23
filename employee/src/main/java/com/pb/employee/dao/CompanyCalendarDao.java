package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;

import java.util.Collection;

public interface CompanyCalendarDao extends Dao<CompanyCalendarEntity>{

    default Class<CompanyCalendarEntity> getEntityClass() {
        return CompanyCalendarEntity.class;
    }

    Collection<CompanyCalendarEntity> getCompanyCalendar(String companyName, String calendarId, String companyId) throws EmployeeException;

    Collection<CompanyCalendarEntity> getCompanyCalendarByYear(String companyName, String year, String companyId) throws EmployeeException;
}
