package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.CustomerRequest;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

public interface CustomerService {

    ResponseEntity<?> createCustomer(CustomerRequest customerRequest) throws InvoiceException;

    ResponseEntity<?> getCustomer(String customerId) throws InvoiceException;

    ResponseEntity<?> getAllCustomers() throws InvoiceException;

    ResponseEntity<?> deleteCustomer(String customerId) throws InvoiceException;

    ResponseEntity<?> updateCustomer(String customerId, CustomerRequest customerRequest) throws IOException, InvoiceException;
}
