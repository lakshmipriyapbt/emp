package com.pb.employee.repository;


import com.pb.employee.controller.filter.Filter;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.IDEntity;

import java.util.Collection;
import java.util.Optional;

public interface Repository {

    <T extends IDEntity> Optional<T> get(String id, Class<T> documentClass, String indexName) throws EmployeeException;

    <T extends IDEntity> Collection<T> search(Collection<Filter> filters, Class<T> documentClass, String indexName) throws EmployeeException;

    <T extends IDEntity> Collection<T> getAll(Class<T> documentClass, String indexName) throws EmployeeException;

    <T extends IDEntity> T save(T entity, String indexName) throws EmployeeException;

    <T extends IDEntity> T update(T entity, String indexName) throws EmployeeException;

    <T extends IDEntity> void delete(String id,  Class<T> documentClass, String indexName) throws EmployeeException;
}
