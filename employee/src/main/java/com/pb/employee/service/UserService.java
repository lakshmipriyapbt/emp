package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface UserService {
    ResponseEntity<?> registerUser(UserRequest userRequest, HttpServletRequest request) throws EmployeeException, IOException;

    ResponseEntity<?>getUserById(String companyName,String employeeId)throws EmployeeException;

    ResponseEntity<?>getCompanyUsers(String companyName)throws EmployeeException;

    ResponseEntity<?>updateUser(String employeeId, UserUpdateRequest userUpdateRequest)throws EmployeeException;

    ResponseEntity<?>deleteUser(String companyName, String employeeId)throws EmployeeException;

}