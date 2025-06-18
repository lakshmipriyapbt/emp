package com.pb.employee.daoImpl;

import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.persistance.model.IDEntity;
import com.pb.employee.persistance.model.TDSEntity;
import com.pb.employee.persistance.model.*;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public class DocumentType {

    private final String type;
    private final Class<? extends IDEntity> entityClass;

    private static final Map<Class<? extends Entity>, DocumentType> typeMap = new HashMap<>();

    public DocumentType(String type, Class<? extends IDEntity> entityClass) {
        this.type = type;
        this.entityClass = entityClass;
        typeMap.put(entityClass, this);
    }

    public static <T extends Entity> DocumentType getByType(Class<T> type) {
        return typeMap.get(type);
    }

    public static final DocumentType COMPANY_CALENDAR = new DocumentType("company_calendar", CompanyCalendarEntity.class);
    public static final DocumentType COMPANY_TDS = new DocumentType("company_tds", TDSEntity.class);
    public static final DocumentType USER = new DocumentType("user", UserEntity.class);
    public static final DocumentType CANDIDATE = new DocumentType("candidate" , CandidateEntity.class);
    public static final DocumentType DOCUMENT = new DocumentType("document" , EmployeeDocumentEntity.class);

}
