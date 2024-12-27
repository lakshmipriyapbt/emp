package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.mappers.CustomerMapper;
import com.invoice.model.CustomerModel;
import com.invoice.model.ProductModel;
import com.invoice.repository.CustomerRepository;
import com.invoice.request.CustomerRequest;
import com.invoice.service.CustomerService;
import com.invoice.util.Constants;
import com.invoice.util.CustomerUtils;
import com.invoice.util.ProductUtils;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

import static com.invoice.util.CustomerUtils.updateCustomerFromRequest;

@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;
    private final CustomerMapper customerMapper;

    @Autowired
    public CustomerServiceImpl(CustomerRepository repository, CustomerMapper customerMapper) {
        this.repository = repository;
        this.customerMapper = customerMapper;
    }

    @Override
    public ResponseEntity<?> createCustomer(CustomerRequest customerRequest) throws InvoiceException {
        log.debug("Creating customer: {}", customerRequest);
        try {
            if (repository.existsByEmail(customerRequest.getEmail())) {
                log.error("Email already exists: {}", customerRequest.getEmail());
                throw new InvoiceException(InvoiceErrorMessageKey.EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
            }
            if (repository.existsByMobileNumber(customerRequest.getMobileNumber())) {
                log.error("Mobile number already exists: {}", customerRequest.getMobileNumber());
                throw new InvoiceException(InvoiceErrorMessageKey.MOBILE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
            }
            CustomerModel customer = CustomerUtils.populateCustomerFromRequest(customerRequest);

            log.debug("Product to save: {}", customer);
            CustomerModel savedCustomer = repository.save(customer);

            log.info("Product created successfully with ID: {}", savedCustomer.getCustomerId());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse((String) Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected error occurred while creating customer: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCustomer(String customerId) throws InvoiceException {
        log.info("Fetching customer with ID: {}", customerId);
        try {
            Optional<CustomerModel> customer = repository.findById(customerId);
            if (customer.isPresent()) {
                CustomerModel customerData = customer.get();
                customerData.setInvoiceModel(null);
                return ResponseEntity.ok(customerData);
            } else {
                log.error("Customer not found with ID: {}", customerId);
                throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error fetching customer with ID {}: {}", customerId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> getAllCustomers() throws InvoiceException {
        log.info("Fetching all customers");
        try {
            List<CustomerModel> customers = repository.findAll();
            if (customers == null || customers.isEmpty()) {
                log.info("No customers found in the database.");
                return ResponseEntity.ok(Collections.emptyList());
            }
            List<Map<String, Object>> responseList = customers.stream()
                    .map(customerMapper::toResponseMap)
                    .collect(Collectors.toList());
            log.info("All customers fetched successfully, total count: {}", responseList.size());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseList), HttpStatus.OK);
        } catch (Exception e) {
            log.error("An error occurred while fetching all customers: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateCustomer(String customerId, @Valid CustomerRequest customerRequest) throws InvoiceException {
        log.info("Updating customer with ID: {}", customerId);
        try {
            CustomerModel customerToUpdate = repository.findById(customerId)
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND));

            updateCustomerFromRequest(customerToUpdate, customerRequest);

            if (!customerToUpdate.getEmail().equals(customerRequest.getEmail()) &&
                    repository.existsByEmail(customerRequest.getEmail())) {
                log.error("Email already exists: {}", customerRequest.getEmail());
                throw new InvoiceException(InvoiceErrorMessageKey.EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
            }

            if (!customerToUpdate.getGstNo().equals(customerRequest.getGstNo()) &&
                    repository.existsByGstNo(customerRequest.getGstNo())) {
                log.error("GST Number already exists: {}", customerRequest.getGstNo());
                throw new InvoiceException(InvoiceErrorMessageKey.GSTNO_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
            }
            repository.save(customerToUpdate);

            log.info("Customer updated successfully with ID: {}", customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS), HttpStatus.OK);

        } catch (InvoiceException e) {
            log.error("Error while updating customer with ID {}: {}", customerId, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating customer: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteCustomer(String customerId) throws InvoiceException {
        log.info("Deleting customer with ID: {}", customerId);
        try {
            if (!repository.existsById(customerId)) {
                log.error("Customer not found with ID: {}", customerId);
                throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            repository.deleteById(customerId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETE_SUCCESS), HttpStatus.OK);
        }  catch (Exception e) {
            log.error("Error deleting customer with ID {}: {}", customerId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}