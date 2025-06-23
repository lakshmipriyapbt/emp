package com.pb.employee.dao;

import com.pb.employee.persistance.model.AppraisalEntity;

import java.util.Collection;

public interface AppraisalDao extends Dao<AppraisalEntity>{

    default Class<AppraisalEntity> getEntityClass() {return AppraisalEntity.class;}

    Collection<AppraisalEntity> getAppraisal(String companyId,String employeeId,String appraisalId) throws Exception;
}
