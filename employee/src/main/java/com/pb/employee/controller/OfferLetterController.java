package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.OfferLetterEntity;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.request.OfferLetterRequest;
import com.pb.employee.request.OfferLetterUpdateRequest;
import com.pb.employee.service.OfferLetterService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class OfferLetterController {

    @Autowired
    private OfferLetterService offerLetterService;

    // ✅ Download + Save Offer Letter
    @RequestMapping(value = "/offerletter/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getOfferLetter.tag}",
            description = "${api.getOfferLetter.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadOfferLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}",
                    example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @RequestBody @Valid OfferLetterRequest offerLetterRequest,
            HttpServletRequest request) {

        // ✅ Saving is done inside the service
        return offerLetterService.downloadOfferLetter(offerLetterRequest, request);
    }

    @GetMapping("/{companyName}/offerletter/{offerLetterId}")
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getOfferLetterById.tag}", description = "${api.getOfferLetterById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getOfferLetterById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}",
                    example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String offerLetterId) throws EmployeeException {

        Collection<OfferLetterEntity> offerLetters = offerLetterService.getOfferLetter(companyName, offerLetterId);

        return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(offerLetters));
    }

    @GetMapping("/{companyName}/offerletter")
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAllOfferLetters.tag}", description = "${api.getAllOfferLetters.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllOfferLetters(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}",
                    example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) throws EmployeeException {

        Collection<OfferLetterEntity> offerLetterEntities =
                offerLetterService.getOfferLetter(companyName, null);

        return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(offerLetterEntities));
    }

    @PatchMapping(value = "/company/{companyName}/offerletter/{offerLetterId}")
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateOfferLetter.tag}", description = "${api.updateOfferLetter.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateOfferLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String offerLetterId,
            @Valid @RequestBody OfferLetterUpdateRequest offerLetterUpdateRequest
    ) throws EmployeeException, IOException {

        return offerLetterService.updateOfferLetter(companyName, offerLetterId, offerLetterUpdateRequest);
    }



}
