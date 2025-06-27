package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.request.OfferLetterRequest;
import com.pb.employee.service.OfferLetterService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // ✅ Download + Save Internship Offer Letter
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

        // ✅ Saving is done inside the service
        return offerLetterService.downloadInternShipOfferLetter(internshipOfferLetterRequest, request);
    }
}
