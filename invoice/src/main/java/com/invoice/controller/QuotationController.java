package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.QuotationRequest;
import com.invoice.service.QuotationService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/quotation")
public class QuotationController {

    @Autowired
    private QuotationService quotationService;

    @PostMapping("")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.createQuotation.tag}", description = "${api.createQuotation.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "201", description = "Quotation created successfully")
    public ResponseEntity<?> saveQuotation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @Parameter(required = true, description = "${api.createQuotationPayload.description}")
                                           @RequestBody @Valid QuotationRequest quotationRequest) throws InvoiceException {

        return quotationService.saveQuotation(quotationRequest);
    }
    @GetMapping("/{quotationId}")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.getQuotation.tag}", description = "${api.getQuotation.description}")
    @ApiResponse(responseCode = "200", description = "Quotation fetched successfully", content = @Content(mediaType = "application/json"))

    public ResponseEntity<?> getQuotation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          @Parameter(required = true, description = "The ID of the quotation to retrieve")
                                          @PathVariable String quotationId) throws InvoiceException {

        return quotationService.getQuotation(quotationId);
    }
    @GetMapping("/all")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.getAllQuotations.tag}", description = "${api.getAllQuotations.description}")
    @ApiResponse(responseCode = "200", description = "All quotations fetched successfully", content = @Content(mediaType = "application/json"))
    public ResponseEntity<?> getAllQuotations(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                              @RequestHeader(Constants.AUTH_KEY) String authToken)throws InvoiceException {

        return quotationService.getAllQuotations();
    }
    @PatchMapping("/{quotationId}")
    @Operation(
            security = {@SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateQuotation.tag}",
            description = "${api.updateQuotation.description}"
    )
    @ApiResponse(responseCode = "200", description = "Quotation updated successfully", content = @Content(mediaType = "application/json"))
    public ResponseEntity<?> updateQuotation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "The ID of the quotation to update")
                                             @PathVariable String quotationId,
                                             @Parameter(required = true, description = "${api.updateQuotationPayload.description}")
                                             @RequestBody @Valid QuotationRequest request) throws InvoiceException {

        return quotationService.updateQuotation(quotationId, request);
    }
    @DeleteMapping("/{quotationId}")
    @Operation(
            security = {@SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deleteQuotation.tag}",
            description = "${api.deleteQuotation.description}"
    )
    @ApiResponse(responseCode = "200", description = "Quotation deleted successfully", content = @Content(mediaType = "application/json"))
    public ResponseEntity<?> deleteQuotation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "The ID of the quotation to delete")
                                             @PathVariable String quotationId) throws InvoiceException {

        return quotationService.deleteQuotation(quotationId);
    }
    @GetMapping("/{quotationId}/generate")
    @Operation(security = {@SecurityRequirement(name = Constants.AUTH_KEY)}, summary = "${api.generateQuotation.tag}", description = "${api.generateQuotation.description}")
    @ApiResponse(responseCode = "200", description = "Quotation generated successfully", content = @Content(mediaType = "application/json"))
    public ResponseEntity<?> generateQuotation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @Parameter(required = true, description = "The ID of the quotation to generate")
                                               @PathVariable Long quotationId) throws InvoiceException {

        return quotationService.generateQuotation(quotationId);
    }

}

