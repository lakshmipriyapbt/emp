package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.TDSPayload.TDSCreatePayload;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import com.pb.employee.request.TDSPayload.TDSUpdatePayload;
import org.springframework.http.ResponseEntity;

import java.util.Collection;

public interface TDSService {
    ResponseEntity<?> createCompanyTDS(String companyName, TDSCreatePayload createPayload)
            throws EmployeeException;

    Collection<TDSResPayload> getCompanyTDS(String companyName, String id, String tdsType)
            throws EmployeeException;

    ResponseEntity<?> updateCompanyTDS(String companyName, String id, TDSUpdatePayload updatePayload)
            throws EmployeeException;

    void deleteCompanyTDS(String companyName, String calendarId) throws EmployeeException;

    TDSResPayload getCompanyYearTDS(String companyName, String year, String tdsType)
            throws EmployeeException;
}
