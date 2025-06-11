package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CandidateEntity;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import com.pb.employee.request.CandidatePayload.CandidateResponse;
import com.pb.employee.request.CandidatePayload.CandidateUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

public interface CandidateService {
    ResponseEntity<?> registerCandidate(CandidateRequest candidateRequest, HttpServletRequest request) throws EmployeeException, IOException;


    Collection<CandidateEntity> getCandidate(String companyName, String candidateId) throws EmployeeException, IOException;

    ResponseEntity<?> updateCandidate(String companyName, String candidateId, CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException;

    void deleteCandidateById(String companyName, String Id) throws EmployeeException, IOException;
    }
