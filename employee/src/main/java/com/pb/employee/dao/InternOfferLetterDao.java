package com.pb.employee.dao;

import com.pb.employee.persistance.model.InternOfferLetterEntity;

public interface InternOfferLetterDao extends Dao<InternOfferLetterEntity> {

    default Class<InternOfferLetterEntity> getEntityClass() {return InternOfferLetterEntity.class;}

}
