package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.InternshipCertificateDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternshipCertificateEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Slf4j
@Component
public class InternshipCertificateDaoImpl extends AbstractDao<InternshipCertificateEntity> implements InternshipCertificateDao {

    public InternshipCertificateDaoImpl(Repository repository) {
        super(repository);
    }

    @Override
    public Collection<InternshipCertificateEntity> getInternshipCertificate(String companyName, String employeeId, String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(employeeId)) {
            filters.add(new Filter(Constants.EMPLOYEE_ID, Operator.EQ, employeeId));
        }

        log.info("Searching internship certificate in index [{}] for companyId={} and employeeId={}", companyName, companyId, employeeId);
        return search(filters, companyName);
    }
}
