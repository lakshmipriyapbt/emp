package com.pb.employee.dao;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.Entity;

import java.util.Collection;
import java.util.Optional;

/**
 * @author Susmitha
 * @param <T>
 */

public interface Dao<T extends Entity> {

    Optional<T> get(String id, String companyName) throws EmployeeException;

    Collection<T> search(Collection<Filter> filters, String companyName) throws EmployeeException;

    Collection<T> getAll(String companyName) throws EmployeeException;

    T save(T t, String companyName, String ... params) throws EmployeeException;

    T update(T t, String companyName,  String ... params) throws EmployeeException;

    void delete(String id, String companyName) throws  EmployeeException;

    Class<T> getEntityClass();

}
