package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeDocumentRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface EmployeeDocumentService {

    ResponseEntity<?> uploadEmployeeDocument(String companyName, String candidateId, EmployeeDocumentRequest employeeDocumentRequest)throws EmployeeException, IOException ;

    ResponseEntity<?> getEmployeeDocumentsById(String companyName, String candidateId) throws EmployeeException;

    ResponseEntity<?> deleteEmployeeDocuments(String companyName, String candidateId, String documentId)throws EmployeeException;

}

