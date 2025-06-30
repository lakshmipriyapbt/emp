package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternshipCertificateEntity;
import com.pb.employee.persistance.model.OfferLetterEntity;
import com.pb.employee.request.InternshipCertificateUpdateRequest;
import com.pb.employee.request.OfferLetterRequest;
import com.pb.employee.request.OfferLetterUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface OfferLetterService {


    ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest offerLetterRequest, HttpServletRequest request);

    Collection<OfferLetterEntity> getOfferLetter(String companyName, String offerLetterId) throws EmployeeException;

    ResponseEntity<?> updateOfferLetter(String companyName, String offerLetterId, OfferLetterUpdateRequest offerLetterUpdateRequest) throws EmployeeException, IOException;

}
