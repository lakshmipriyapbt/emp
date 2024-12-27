package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.QuotationRequest;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

public interface QuotationService {


    ResponseEntity<?> saveQuotation(@Valid QuotationRequest request) throws InvoiceException;

   ResponseEntity<?> getQuotation(String quotationId) throws InvoiceException;

    ResponseEntity<?> getAllQuotations() throws InvoiceException;

    ResponseEntity<?> updateQuotation(String quotationId, @Valid QuotationRequest request) throws InvoiceException;

    ResponseEntity<?> deleteQuotation(String quotationId) throws InvoiceException;

    ResponseEntity<?> generateQuotation(Long quotationId) throws InvoiceException;
}
