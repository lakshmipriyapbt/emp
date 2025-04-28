package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarRequest;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarResponse;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.util.Collection;

public interface CompanyCalenderService {
    ResponseEntity<?> createCompanyCalendar(String companyName, CompanyCalendarRequest createPayload)
            throws EmployeeException;

    Collection<CompanyCalendarEntity> getCompanyCalender(String companyName, String year)
            throws EmployeeException;

    ResponseEntity<?> updateCompanyCalendar(String companyName, String id, CompanyCalendarUpdateRequest updatePayload)
            throws EmployeeException;

    void deleteCompanyCalendar(String companyName, String calendarId) throws EmployeeException;

    CompanyCalendarResponse getTodayCompanyCalender(String companyName)
            throws EmployeeException;
}
