package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.persistance.model.UserEntity;

import java.util.Collection;

public interface UserDao extends Dao<UserEntity>{

    default Class<UserEntity> getEntityClass() {
        return UserEntity.class;
    }

    Collection<UserEntity> getUsers(String companyName, String userId, String companyId) throws EmployeeException;
}
