package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.EmployeeDocumentDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.EmployeeDocumentEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import io.micrometer.common.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Slf4j
@Component
public class EmployeeDocumentDaoImpl extends AbstractDao<EmployeeDocumentEntity> implements EmployeeDocumentDao {

    public EmployeeDocumentDaoImpl(Repository repository) {
        super(repository);
    }


    @Override
    public Optional<EmployeeDocumentEntity> getByDocuments(String candidateId, String employeeId, String companyName) {
        try {
            Collection<Filter> filters = new ArrayList<>();
            if (StringUtils.isNotBlank(candidateId)) {
                filters.add(new Filter(Constants.CANDIDATE_ID, Operator.EQ, candidateId));
            }
            if (StringUtils.isNotBlank(employeeId)) {
                filters.add(new Filter(Constants.EMPLOYEE_ID, Operator.EQ, employeeId));
            }
            Collection<EmployeeDocumentEntity> result = search(filters, companyName);

            return Optional.of(result.iterator().next());
        } catch (Exception e) {
            log.error("Error while fetching employee document by candidateId: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}
