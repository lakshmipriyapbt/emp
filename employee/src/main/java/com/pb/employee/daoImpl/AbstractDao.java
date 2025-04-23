package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.Dao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.EntityManager;
import com.pb.employee.persistance.model.IDEntity;
import com.pb.employee.repository.Repository;

import java.util.Collection;
import java.util.Optional;

public abstract class AbstractDao<T extends IDEntity> implements Dao<T> {

    private final Repository repository;

    public AbstractDao(Repository repository) {
        this.repository = repository;
    }

    public Optional<T> get(String id, String companyName) throws EmployeeException {
        return EntityManager.get(id, getEntityClass(), companyName, repository);
    }

    public Collection<T> getAll(String companyName) throws EmployeeException {
        return EntityManager.getAll(getEntityClass(),companyName, repository);
    }

    public Collection<T> search(Collection<Filter> filters, String companyName) throws EmployeeException {
        Class<T> entityClass = getEntityClass();
        DocumentType documentType = DocumentType.getByType(entityClass);
        if (documentType != null && !hasField(filters, "type")) {
            filters.add(new Filter("type", Operator.EQ, documentType.getType()));
        }
        return EntityManager.search(filters, entityClass,companyName, repository);
    }

    public T save(T entity, String companyName, String... params) throws EmployeeException {
        return EntityManager.save(entity,companyName, repository);
    }

    public T update(T entity, String companyName, String... params) throws EmployeeException {
        return EntityManager.update(entity,companyName, repository);
    }

    public void delete(String id, String companyName) throws EmployeeException {
        EntityManager.delete(id, getEntityClass(), companyName, repository);
    }

    private static boolean hasField(Collection<Filter> filters, String field) {
        return filters.stream().anyMatch(f -> f.getField().equalsIgnoreCase(field));
    }
}
