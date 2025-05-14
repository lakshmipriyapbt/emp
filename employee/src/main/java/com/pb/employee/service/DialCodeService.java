package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import org.springframework.http.ResponseEntity;

public interface DialCodeService {


    ResponseEntity<?> getDialCodes() throws EmployeeException;

}
