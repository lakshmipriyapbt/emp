package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.CompanyImageUpdate;
import com.invoice.request.CompanyRequest;
import com.invoice.request.CompanyStampUpdate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CompanyService {

    ResponseEntity<?> createCompany(CompanyRequest companyRequest) throws InvoiceException;

    ResponseEntity<?> getCompany(Long companyId,HttpServletRequest request) throws InvoiceException;

    ResponseEntity<?> updateCompanyImageById(String companyId, CompanyImageUpdate companyImageUpdate, MultipartFile multipartFile) throws InvoiceException, IOException;

    ResponseEntity<?> updateCompanyStampImageById(String companyId, CompanyStampUpdate companyStampUpdate, MultipartFile multipartFile) throws InvoiceException, IOException;

    ResponseEntity<?> getAllCompanies(HttpServletRequest request) throws InvoiceException;

    ResponseEntity<?> deleteCompany(Long companyId) throws InvoiceException;

    ResponseEntity<?> updateCompany(Long companyId, CompanyRequest companyRequest) throws IOException, InvoiceException;

    ResponseEntity<?> getCompanyImageById(String companyId, HttpServletRequest request)  throws InvoiceException;
}
