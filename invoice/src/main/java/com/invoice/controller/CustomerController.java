package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.CustomerRequest;
import com.invoice.service.CustomerService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createCustomer.tag}", description = "${api.createCustomer.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Customer created successfully")
    public ResponseEntity<?> createCustomer(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                            @RequestBody @Valid CustomerRequest customerRequest) throws InvoiceException {
        return customerService.createCustomer(customerRequest);
    }

    @GetMapping("/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getCustomer.tag}", description = "${api.getCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer retrieved successfully")
    public ResponseEntity<?> getCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @PathVariable String customerId) throws InvoiceException {
        return customerService.getCustomer(customerId);
    }

    @GetMapping("/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getAllCustomers.tag}", description = "${api.getAllCustomers.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customers retrieved successfully")
    public ResponseEntity<?> getAllCustomers(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                 @RequestHeader(Constants.AUTH_KEY) String authToken) throws InvoiceException {
        return customerService.getAllCustomers();
    }

    @PatchMapping("/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateCustomer.tag}", description = "${api.updateCustomer.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer updated successfully")
    public ResponseEntity<?> updateCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String customerId,
                                            @RequestBody @Valid CustomerRequest customerRequest) throws InvoiceException, IOException {
        return customerService.updateCustomer(customerId, customerRequest);
    }

    @DeleteMapping("/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteCustomer.tag}", description = "${api.deleteCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer deleted successfully")
    public ResponseEntity<?> deleteCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String customerId) throws InvoiceException {
        return customerService.deleteCustomer(customerId);
    }
}
