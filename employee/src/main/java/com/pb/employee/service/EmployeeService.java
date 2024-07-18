package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.*;
import com.pb.employee.response.CompanyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface EmployeeService {
    ResponseEntity<?> registerEmployee(EmployeeRequest employeeRequest) throws EmployeeException;
    ResponseEntity<?> getEmployees(String companyName) throws IOException, EmployeeException;
    ResponseEntity<?> getEmployeeById(String companyName, String employeeId) throws EmployeeException;
    ResponseEntity<?> updateEmployeeById(String employeeId, EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException;
    ResponseEntity<?> deleteEmployeeById( String companyName,String employeeId) throws EmployeeException;
}