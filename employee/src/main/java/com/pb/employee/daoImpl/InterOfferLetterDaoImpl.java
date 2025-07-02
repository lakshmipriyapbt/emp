package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.InternOfferLetterDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.persistance.model.InternOfferLetterEntity;
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
public class InterOfferLetterDaoImpl extends AbstractDao<InternOfferLetterEntity> implements InternOfferLetterDao {

    public InterOfferLetterDaoImpl(Repository repository){
        super(repository);
    }

    @Override
    public Collection<InternOfferLetterEntity> getInternshipOfferLetter(String companyName, String internOfferLetterId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(internOfferLetterId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, internOfferLetterId));
        }

        log.info("Searching internship offer letter in index [{}] for offerLetterId={}", companyName, internOfferLetterId);
        Collection<InternOfferLetterEntity> results = search(filters, companyName);

        if (results.isEmpty()) {
            log.error("Internship offer letter not found for offerLetterId: {}", internOfferLetterId);
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERNSHIP_NOT_FOUND), internOfferLetterId),
                    HttpStatus.NOT_FOUND
            );
        }

        return results;
    }

}
