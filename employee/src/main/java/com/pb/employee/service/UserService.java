package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface UserService {
    ResponseEntity<?> registerUser(UserRequest userRequest) throws EmployeeException, IOException;

    ResponseEntity<?>getUserById(String companyName,String Id)throws EmployeeException;

    ResponseEntity<?>getCompanyUsers(String companyName)throws EmployeeException;

    ResponseEntity<?>updateUser(String Id, UserUpdateRequest userUpdateRequest)throws EmployeeException;

    ResponseEntity<?>deleteUser(String companyName, String Id)throws EmployeeException;

}