package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.InternshipCertificateDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.persistance.model.InternshipCertificateEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
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
    public Collection<InternshipCertificateEntity> getInternshipCertificate(String companyName, String internshipId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(internshipId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, internshipId));
        }

        log.info("Searching internship certificate in index [{}] for internshipId={}", companyName, internshipId);
        Collection<InternshipCertificateEntity> results = search(filters, companyName);

        if (results.isEmpty()) {
            log.error("Internship certificate not found for internshipId: {}", internshipId);
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERNSHIP_NOT_FOUND), internshipId),
                    HttpStatus.NOT_FOUND
            );
        }
        return results;
    }



}
