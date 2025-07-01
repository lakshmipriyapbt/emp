package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.*;
import com.pb.employee.response.EmployeeResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EmployeeService {
    ResponseEntity<?> registerEmployee(EmployeeRequest employeeRequest, HttpServletRequest request) throws EmployeeException;
    ResponseEntity<?> getEmployees(String companyName) throws IOException, EmployeeException;
    EmployeeResponse getEmployeeById(String companyName, String employeeId) throws EmployeeException;
    ResponseEntity<?> updateEmployeeById(String employeeId, EmployeeUpdateRequest employeeUpdateRequest) throws IOException, EmployeeException;
    ResponseEntity<?> deleteEmployeeById( String companyName,String employeeId) throws EmployeeException;

    ResponseEntity<byte[]> downloadEmployeeDetails(String companyName, String format, HttpServletRequest request) throws Exception;

    ResponseEntity<byte[]> downloadEmployeeBankDetails(String companyName, String format, HttpServletRequest request) throws Exception;

    ResponseEntity<?> getEmployeeWithoutAttendance(String companyName,String month,String year)throws IOException,EmployeeException;

    ResponseEntity<?> getEmployeeId(String companyName, EmployeeIdRequest employeeIdRequest) throws IOException, EmployeeException;

    ResponseEntity<?> registerEmployeeWithCandidate(EmployeeRequest employeeRequest, String candidateId, HttpServletRequest request) throws EmployeeException;

    ResponseEntity<?> uploadEmployeeImage(String companyName, String employeeId, MultipartFile file) throws EmployeeException, IOException;

    ResponseEntity<?> getEmployeeImage(String companyName, String employeeId,HttpServletRequest request) throws EmployeeException, IOException;}