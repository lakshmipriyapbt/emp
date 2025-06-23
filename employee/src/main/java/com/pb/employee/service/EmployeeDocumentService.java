package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeDocumentRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface EmployeeDocumentService {

    ResponseEntity<?> uploadEmployeeDocument(String companyName, String candidateId, String employeeId, EmployeeDocumentRequest employeeDocumentRequest)throws EmployeeException, IOException ;

    ResponseEntity<?> getEmployeeDocumentsById(String companyName, String candidateId, String employeeId, HttpServletRequest request) throws EmployeeException;

    ResponseEntity<?> deleteDocumentsByReferenceId(String companyName, String candidateId, String employeeId, String documentId)throws EmployeeException;

}

