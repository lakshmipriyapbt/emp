package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CandidateEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import io.micrometer.common.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Slf4j
@Component
public class CandidateDaoImpl extends AbstractDao<CandidateEntity> implements CandidateDao {


    public CandidateDaoImpl(Repository repository) {
        super(repository);
    }

    @Override
    public Collection<CandidateEntity> getCandidates(String companyName, String candidateId, String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }

        if (StringUtils.isNotBlank(candidateId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, candidateId));
        }

        filters.add(new Filter(Constants.TYPE, Operator.EQ, "candidate"));

        return search(filters, companyName);
    }

}
