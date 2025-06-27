package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.request.OfferLetterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface OfferLetterService {


    ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest offerLetterRequest, HttpServletRequest request);

    ResponseEntity<byte[]> downloadInternShipOfferLetter(InternshipOfferLetterRequest internshipOfferLetterRequest, HttpServletRequest request) throws EmployeeException;

}
