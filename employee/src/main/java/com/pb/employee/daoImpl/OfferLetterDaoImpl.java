package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.OfferLetterDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.persistance.model.OfferLetterEntity;
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
public class OfferLetterDaoImpl extends AbstractDao<OfferLetterEntity> implements OfferLetterDao {
    public OfferLetterDaoImpl(Repository repository){
        super(repository);
    }

    @Override
    public Collection<OfferLetterEntity> getOfferLetter(String companyName, String offerLetterId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(offerLetterId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, offerLetterId));
        }

        return search(filters, companyName);
    }
}
