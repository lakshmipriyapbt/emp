package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.AppraisalDao;
import com.pb.employee.persistance.model.AppraisalEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class AppraisalDaoImpl extends AbstractDao<AppraisalEntity> implements AppraisalDao {

    public AppraisalDaoImpl(Repository repository) {
        super(repository);
    }

    @Override
    public Collection<AppraisalEntity> getAppraisal(String companyName, String employeeId, String companyId) throws Exception {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(employeeId)) {
            filters.add(new Filter(Constants.EMPLOYEE_ID, Operator.EQ, employeeId));
        }
        return search(filters, companyName);
    }

}
