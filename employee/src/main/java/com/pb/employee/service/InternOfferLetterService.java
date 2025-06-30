package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternOfferLetterEntity;
import com.pb.employee.request.InternshipOfferLetterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface InternOfferLetterService {

    ResponseEntity<byte[]> downloadInternShipOfferLetter(InternshipOfferLetterRequest internshipOfferLetterRequest, HttpServletRequest request) throws EmployeeException;

    Collection<InternOfferLetterEntity> getInternshipOfferLetter(String companyName, String internOfferLetterId) throws EmployeeException;

    ResponseEntity<?> updateInternshipOfferLetter(String companyName, String internOfferLetterId, InternshipOfferLetterRequest internshipOfferLetterRequest) throws EmployeeException, IOException;

}