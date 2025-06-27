package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.ExperienceEntity;

import java.util.Collection;

public interface ExperienceDao extends Dao<ExperienceEntity>{

    default Class<ExperienceEntity> getEntityClass() {return ExperienceEntity.class;}

    Collection<ExperienceEntity> getExperienceLetter(String companyName, String employeeId, String companyId) throws EmployeeException;

}
