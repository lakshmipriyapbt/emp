package com.pb.employee.daoImpl;

import com.pb.employee.dao.InternOfferLetterDao;
import com.pb.employee.persistance.model.InternOfferLetterEntity;
import com.pb.employee.repository.Repository;
import org.springframework.stereotype.Component;


@Component
public class InterOfferLetterDaoImpl extends AbstractDao<InternOfferLetterEntity> implements InternOfferLetterDao {

    public InterOfferLetterDaoImpl(Repository repository){
        super(repository);
    }
}
