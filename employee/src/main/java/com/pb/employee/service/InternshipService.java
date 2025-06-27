package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternshipCertificateEntity;
import com.pb.employee.request.InternshipCertificateUpdateRequest;
import com.pb.employee.request.InternshipRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface InternshipService {

    ResponseEntity<byte[]> downloadInternship(InternshipRequest internshipRequest, HttpServletRequest request);

    Collection<InternshipCertificateEntity> getInternshipCertificates(String companyName, String employeeId) throws EmployeeException;

    ResponseEntity<?> updateInternshipCertificate(String companyName, String internshipId, InternshipCertificateUpdateRequest internshipCertificateUpdateRequest) throws EmployeeException, IOException;
}
