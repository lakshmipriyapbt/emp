package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.OfferLetterEntity;

import java.util.Collection;

public interface OfferLetterDao extends Dao<OfferLetterEntity> {

    default Class<OfferLetterEntity> getEntityClass() {return OfferLetterEntity.class;}

    Collection<OfferLetterEntity> getOfferLetter(String companyName, String offerLetterId) throws EmployeeException;

}
