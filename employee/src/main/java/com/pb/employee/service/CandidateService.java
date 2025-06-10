package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import com.pb.employee.request.CandidatePayload.CandidateResponse;
import com.pb.employee.request.CandidatePayload.CandidateUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

public interface CandidateService {
    ResponseEntity<?> registerCandidate(CandidateRequest candidateRequest, HttpServletRequest request) throws EmployeeException, IOException;

    ResponseEntity<CandidateResponse> getCandidateById(String companyName, String candidateId) throws EmployeeException, IOException;

    ResponseEntity<List<CandidateResponse>> getCandidates(String companyName) throws IOException, EmployeeException;

    ResponseEntity<?> updateCandidate(String companyName, String candidateId, CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException;

    void deleteCandidateById(String companyName, String Id) throws EmployeeException, IOException;
    }
