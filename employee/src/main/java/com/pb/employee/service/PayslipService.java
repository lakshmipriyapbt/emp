package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface PayslipService {

    ResponseEntity<?> generatePaySlip(PayslipRequest payslipRequest, String salaryId, String employeeId,HttpServletRequest request) throws EmployeeException, IOException;

    ResponseEntity<?> generatePaySlipForAllEmployees(PayslipRequest payslipRequest,HttpServletRequest request) throws EmployeeException, IOException;

    ResponseEntity<?> getPayslipById(String companyName, String employeeId , String payslipId) throws EmployeeException, IOException;
    ResponseEntity<?> getEmployeePayslips(String companyName, String employeeId,String month,String year) throws EmployeeException;

    ResponseEntity<?> deleteEmployeePayslipById(String companyName, String employeeId,String payslipId) throws EmployeeException;
    ResponseEntity<?> getAllEmployeesPayslips(String companyName, String month, String year)throws EmployeeException;
    byte[] downloadPayslip(String companyName, String payslipId, String employeeId, HttpServletRequest request);

    ResponseEntity<?> generatePaySlipForEmployees(PayslipRequest payslipRequest) throws EmployeeException, IOException;

    ResponseEntity<?> savePayslip(PayslipUpdateRequest payslipsRequest, String payslipId, String employeeId,HttpServletRequest request) throws EmployeeException, IOException;

}
