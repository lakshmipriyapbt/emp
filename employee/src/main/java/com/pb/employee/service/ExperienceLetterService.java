package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.ExperienceEntity;
import com.pb.employee.request.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface ExperienceLetterService {

    ResponseEntity<byte[]> downloadServiceLetter(HttpServletRequest request,ExperienceLetterFieldsRequest experienceLetterFieldsRequest);

    ResponseEntity<byte[]> uploadExperienceLetter(ExperienceLetterRequest request);

    Collection<ExperienceEntity> getExperienceLetter(String companyName, String experienceId) throws EmployeeException;

    ResponseEntity<?> updateExperienceById(String companyName, String experienceId, ExperienceLetterFieldsUpdateRequest experienceLetterFieldsUpdateRequest) throws EmployeeException, IOException;
}
