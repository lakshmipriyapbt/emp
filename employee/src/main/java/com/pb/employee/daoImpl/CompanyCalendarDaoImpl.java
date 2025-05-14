package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.CompanyCalendarDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class CompanyCalendarDaoImpl extends AbstractDao<CompanyCalendarEntity> implements CompanyCalendarDao {

    public CompanyCalendarDaoImpl(Repository repository){
        super(repository);
    }

    @Override
    public Collection<CompanyCalendarEntity> getCompanyCalendar(String companyName, String calendarId,  String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(calendarId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, calendarId));
        }
        return search(filters, companyName);
    }

    public Collection<CompanyCalendarEntity> getCompanyCalendarByYear(String companyName, String year, String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(year)) {
            filters.add(new Filter(Constants.YEAR, Operator.EQ, year));
        }
        return search(filters, companyName);
    }
}
