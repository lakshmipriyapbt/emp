package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.UserDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.UserEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.util.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class UserDaoImpl extends AbstractDao<UserEntity> implements UserDao {


    public UserDaoImpl(Repository repository) {
        super(repository);
    }

    @Override
    public Collection<UserEntity> getUsers(String companyName, String userId, String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(userId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, userId));
        }

        return search(filters, companyName);
    }

}