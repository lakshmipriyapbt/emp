package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternOfferLetterEntity;

import java.util.Collection;

public interface InternOfferLetterDao extends Dao<InternOfferLetterEntity> {

    default Class<InternOfferLetterEntity> getEntityClass() {return InternOfferLetterEntity.class;}

    Collection<InternOfferLetterEntity> getInternshipOfferLetter(String companyName, String internOfferLetterId) throws EmployeeException;


}
