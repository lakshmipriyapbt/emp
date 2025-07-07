package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

public interface SalaryService {


    ResponseEntity<?> addSalary(EmployeeSalaryRequest salaryRequest,String employeeId)throws EmployeeException;

    List<EmployeeSalaryResPayload> getEmployeeSalary(String companyName, String employeeId) throws EmployeeException;

    ResponseEntity<?> getEmployeeSalaryById(String companyName, String employeeId,String salaryId) throws EmployeeException, IOException;

    ResponseEntity<?> updateEmployeeSalaryById(String employeeId, SalaryUpdateRequest salaryRequest, String salaryId) throws EmployeeException;

    ResponseEntity<?> deleteEmployeeSalaryById(String companyNae,String employeeId, String salaryId) throws EmployeeException;

    ResponseEntity<byte[]> downloadEmployeesSalaries(String companyName, String format,EmployeeDetailsDownloadRequest detailsDownloadRequest ,HttpServletRequest request) throws Exception;
}