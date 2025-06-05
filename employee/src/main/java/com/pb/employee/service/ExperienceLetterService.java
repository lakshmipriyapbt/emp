package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.CompanyRequest;
import com.pb.employee.request.EmployeeRequest;
import com.pb.employee.request.ExperienceLetterFieldsRequest;
import com.pb.employee.request.ExperienceLetterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface ExperienceLetterService {

    ResponseEntity<byte[]> downloadServiceLetter(HttpServletRequest request,ExperienceLetterFieldsRequest experienceLetterFieldsRequest) throws EmployeeException;

    ResponseEntity<byte[]> uploadExperienceLetter(ExperienceLetterRequest request);

}
