package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.InternshipCertificateEntity;
import com.pb.employee.request.InternshipCertificateUpdateRequest;
import com.pb.employee.request.InternshipRequest;
import com.pb.employee.service.InternshipService;
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
public class InternshipController {

    @Autowired
    private InternshipService internshipService;


    @RequestMapping(value = "/internship/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getInternship.tag}", description = "${api.getInternship.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadInternship(@Parameter(hidden = true, required = true,
            description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @RequestBody @Valid InternshipRequest internshipRequest,
                                                  HttpServletRequest request) {
        return internshipService.downloadInternship(internshipRequest, request);
    }

    @GetMapping("/{companyName}/internshipcertificate/employee/{employeeId}")
    @io.swagger.v3.oas.annotations.Operation(
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getInternshipCertificateByEmployeeId.tag}",
            description = "${api.getInternshipCertificateByEmployeeId.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getInternshipCertificateByEmployeeId(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String employeeId) throws EmployeeException {

        Collection<InternshipCertificateEntity> internshipCertificateEntities =
                internshipService.getInternshipCertificates(companyName, employeeId);

        return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(internshipCertificateEntities));
    }

    @PatchMapping(value = "company/{companyName}/employee/{employeeId}/internship-certificate")
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateInternshipCertificate.tag}", description = "${api.updateInternshipCertificate.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateInternshipCertificate(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String employeeId,
            @Valid @RequestBody InternshipCertificateUpdateRequest internshipCertificateUpdateRequest) throws EmployeeException, IOException {

        return internshipService.updateInternshipCertificate(companyName, employeeId, internshipCertificateUpdateRequest);
    }
}
