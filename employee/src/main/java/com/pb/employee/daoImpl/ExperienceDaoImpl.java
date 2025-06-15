package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.ExperienceDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.ExperienceEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Slf4j
@Component
public class ExperienceDaoImpl extends AbstractDao<ExperienceEntity>implements ExperienceDao {

    public ExperienceDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<ExperienceEntity> getExperienceLetter(String companyName, String experienceId, String companyId) throws  EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(experienceId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, experienceId));
        }
        return search(filters, companyName);
    }

}
