package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.InvoiceRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface InvoiceService {

    ResponseEntity<?> generateInvoice(String companyId,String customerId,InvoiceRequest request) throws InvoiceException, IOException;

    ResponseEntity<?> getInvoiceById(String companyId,String customerId,String invoiceId)throws InvoiceException, IOException;

    ResponseEntity<?> getCustomerAllInvoices(String companyId,String customerId) throws InvoiceException, IOException;

    ResponseEntity<?> getCompanyAllInvoices(String companyId) throws InvoiceException, IOException;
}
