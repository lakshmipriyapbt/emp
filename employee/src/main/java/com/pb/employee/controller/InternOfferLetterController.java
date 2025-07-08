package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternOfferLetterEntity;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.service.InternOfferLetterService;
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
public class InternOfferLetterController {

    @Autowired
    private InternOfferLetterService internOfferLetterService;

    // Download + Save Internship Offer Letter
    @RequestMapping(value = "/internShipLetter/download", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.downloadInternShipOfferLetter.tag}",
            description = "${api.downloadInternShipOfferLetter.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadInternShipOfferLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}",
                    example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @RequestBody @Valid InternshipOfferLetterRequest internshipOfferLetterRequest,
            HttpServletRequest request) throws EmployeeException {

        return internOfferLetterService.downloadInternShipOfferLetter(internshipOfferLetterRequest, request);
    }

    @GetMapping("/{companyName}/internshipofferletter/{internOfferLetterId}")
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getInternshipOfferLetterById.tag}", description = "${api.getInternshipOfferLetterById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getInternshipOfferLetterById(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String internOfferLetterId) throws EmployeeException {

        Collection<InternOfferLetterEntity> internshipOfferLetters = internOfferLetterService.getInternshipOfferLetter(companyName, internOfferLetterId);

        return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(internshipOfferLetters));
    }

    @GetMapping("/{companyName}/internshipofferletter")
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAllInternshipOfferLetters.tag}", description = "${api.getAllInternshipOfferLetters.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllInternshipOfferLetters(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}",
                    example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName) throws EmployeeException {

        Collection<InternOfferLetterEntity> offerLetters = internOfferLetterService.getInternshipOfferLetter(companyName, null);

        return ResponseEntity.ok(
                ResponseBuilder.builder().build().createSuccessResponse(offerLetters)
        );
    }

    @PatchMapping(value = "company/{companyName}/{internOfferLetterId}")
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateInternshipOfferLetter.tag}", description = "${api.updateInternshipOfferLetter.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateInternshipOfferLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String internOfferLetterId,
            @Valid @RequestBody InternshipOfferLetterRequest internshipOfferLetterRequest) throws EmployeeException, IOException {

        return internOfferLetterService.updateInternshipOfferLetter(companyName, internOfferLetterId, internshipOfferLetterRequest);
    }


}
