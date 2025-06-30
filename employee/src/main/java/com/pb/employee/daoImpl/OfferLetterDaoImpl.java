package com.pb.employee.daoImpl;

import com.pb.employee.dao.OfferLetterDao;
import com.pb.employee.persistance.model.OfferLetterEntity;
import com.pb.employee.repository.Repository;
import org.springframework.stereotype.Component;


@Component
public class OfferLetterDaoImpl extends AbstractDao<OfferLetterEntity> implements OfferLetterDao {
    public OfferLetterDaoImpl(Repository repository){
        super(repository);
    }

}
