package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.InvoiceRequest;
import com.invoice.service.InvoiceService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createInvoice.tag}", description = "${api.createInvoice.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "201", description = "Invoice created successfully")
    public ResponseEntity<?> saveInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken,
                                         @Parameter(required = true, description = "${api.createInvoicePayload.description}")
                                         @RequestBody @Valid InvoiceRequest invoiceRequest) throws InvoiceException {

        return invoiceService.saveInvoice(invoiceRequest);
    }

    @GetMapping("/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getInvoice.tag}", description = "${api.getInvoice.description}")
    @ApiResponse(responseCode = "200", description = "Invoice retrieved successfully")
    public ResponseEntity<?> getInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                        @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @PathVariable String invoiceId) throws InvoiceException {

        return invoiceService.getInvoice(invoiceId);
    }

    @GetMapping("/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getAllInvoices.tag}", description = "${api.getAllInvoices.description}")
    @ApiResponse(responseCode = "200", description = "Invoices retrieved successfully")
    public ResponseEntity<?> getAllInvoices(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken) throws InvoiceException {
        return invoiceService.getAllInvoices();
    }

    @PatchMapping("/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateInvoice.tag}", description = "${api.updateInvoice.description}")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Invoice updated successfully")
    public ResponseEntity<?> updateInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String invoiceId,
                                           @RequestBody @Valid InvoiceRequest invoiceRequest) throws InvoiceException, IOException {

        return invoiceService.updateInvoice(invoiceId, invoiceRequest);
    }

    @DeleteMapping("/{invoiceId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteInvoice.tag}", description = "${api.deleteInvoice.description}")
    @ApiResponse(responseCode = "200", description = "Invoice deleted successfully")
    public ResponseEntity<?> deleteInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String invoiceId) throws InvoiceException {

        return invoiceService.deleteInvoice(invoiceId);
    }

    @GetMapping("/{invoiceId}/generate")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.generateInvoice.tag}", description = "${api.generateInvoice.description}")
    @ApiResponse(responseCode = "200", description = "Invoice generated successfully")
    public ResponseEntity<?> generateInvoice(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @PathVariable String invoiceId, HttpServletRequest request) throws InvoiceException {

        return invoiceService.generateInvoice(invoiceId,request);
    }
}
