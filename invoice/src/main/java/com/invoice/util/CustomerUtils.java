package com.invoice.util;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.CustomerModel;
import com.invoice.request.CustomerRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;

public class CustomerUtils {

    public static CustomerModel populateCustomerFromRequest(CustomerRequest customerRequest) {
        CustomerModel customer = new CustomerModel();
        BeanUtils.copyProperties(customerRequest, customer);
        return customer;
    }
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void updateCustomerFromRequest(CustomerModel customerToUpdate, CustomerRequest customerRequest) throws JsonMappingException, InvoiceException {
        if (customerRequest == null) {
            throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_NULL.getMessage(), HttpStatus.NOT_FOUND);
        }
        OBJECT_MAPPER.updateValue(customerToUpdate, customerRequest);
    }
}