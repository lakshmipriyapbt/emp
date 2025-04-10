package com.pb.employee.service;


import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.AttendanceRequest;
import com.pb.employee.request.AttendanceUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface AttendanceService {

    ResponseEntity<?> uploadAttendanceFile(String company,MultipartFile file) throws EmployeeException;
    ResponseEntity<?> getAllEmployeeAttendance(String companyName,String employeeId,String month,String year)throws IOException,EmployeeException;

    ResponseEntity<?> deleteEmployeeAttendanceById(String companyName, String employeeId, String attendanceId)throws EmployeeException;

    ResponseEntity<?> updateEmployeeAttendanceById(String company, String employeeId, String attendanceId, AttendanceUpdateRequest updateRequest) throws  EmployeeException;

    ResponseEntity<byte[]> downloadEmployeeAttendance(String companyName, String month, String year, String employeeId, String format, HttpServletRequest request) throws Exception;
}
