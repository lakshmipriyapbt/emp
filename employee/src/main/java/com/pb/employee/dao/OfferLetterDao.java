package com.pb.employee.dao;

import com.pb.employee.persistance.model.OfferLetterEntity;

public interface OfferLetterDao extends Dao<OfferLetterEntity> {

    default Class<OfferLetterEntity> getEntityClass() {return OfferLetterEntity.class;}

}
