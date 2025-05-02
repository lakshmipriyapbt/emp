package com.pb.employee.daoImpl;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.dao.TDSDao;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.TDSEntity;
import com.pb.employee.repository.Repository;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import com.pb.employee.util.Constants;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class TDSDaoImpl extends AbstractDao<TDSEntity>  implements TDSDao {

    public TDSDaoImpl(Repository repository){
        super(repository);
    }

    public Collection<TDSEntity> getCompanyTDS(String companyName, String id, String year, String tdsType, String companyId) throws EmployeeException {
        Collection<Filter> filters = new ArrayList<>();
        if (StringUtils.isNotBlank(companyName)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(id)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, id));
        }
        if (StringUtils.isNotBlank(year)) {
            filters.add(new Filter(Constants.START_YEAR, Operator.EQ, year));
        }
        if (StringUtils.isNotBlank(tdsType)) {
            filters.add(new Filter(Constants.TDS_TYPE, Operator.EQ, tdsType));
        }
        return search(filters, companyName);
    }


}
