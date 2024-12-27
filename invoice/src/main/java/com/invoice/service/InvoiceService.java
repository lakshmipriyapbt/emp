package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.InvoiceRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface InvoiceService {

    ResponseEntity<?> saveInvoice(InvoiceRequest request) throws InvoiceException;

    ResponseEntity<?> getInvoice(String invoiceId) throws InvoiceException;

    ResponseEntity<?> getAllInvoices() throws InvoiceException;

    ResponseEntity<?> updateInvoice(String invoiceId, InvoiceRequest request) throws InvoiceException;

    ResponseEntity<?> deleteInvoice(String invoiceId) throws InvoiceException;

    ResponseEntity<?> generateInvoice(String invoiceId, HttpServletRequest request) throws InvoiceException;
}
