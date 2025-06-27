package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeDocumentRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EmployeeDocumentService {

    ResponseEntity<?> uploadEmployeeDocument(String companyName, String candidateId, String employeeId, EmployeeDocumentRequest employeeDocumentRequest)throws EmployeeException, IOException ;

    ResponseEntity<?> getEmployeeDocumentsById(String companyName, String candidateId, String employeeId, HttpServletRequest request) throws EmployeeException;

    ResponseEntity<?> deleteDocumentsByReferenceId(String companyName, String candidateId, String employeeId, String documentId)throws EmployeeException;

    ResponseEntity<?> updateDocumentByReferenceId(String companyName, String candidateId, String employeeId, String documentId, EmployeeDocumentRequest employeeDocumentRequest)throws EmployeeException, IOException ;

    ResponseEntity<?> uploadEmployeeImage(String companyName, String employeeId, MultipartFile file) throws EmployeeException, IOException;

    ResponseEntity<?> getEmployeeImage(String companyName, String employeeId,HttpServletRequest request) throws EmployeeException, IOException;

}
