package com.pb.employee.dao;

import com.pb.employee.persistance.model.ExperienceEntity;

public interface ExperienceDao extends Dao<ExperienceEntity>{

    default Class<ExperienceEntity> getEntityClass() {return ExperienceEntity.class;}

}
