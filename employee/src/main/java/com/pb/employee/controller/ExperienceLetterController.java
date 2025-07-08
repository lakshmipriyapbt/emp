package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.ExperienceEntity;
import com.pb.employee.request.ExperienceLetterFieldsRequest;
import com.pb.employee.request.ExperienceLetterFieldsUpdateRequest;
import com.pb.employee.request.ExperienceLetterRequest;
import com.pb.employee.service.ExperienceLetterService;
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
public class ExperienceLetterController {


    @Autowired
    private ExperienceLetterService serviceLetterService;

    @RequestMapping(value = "/experienceletter/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadPayslip(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  HttpServletRequest request,
                                                  @RequestBody @Valid ExperienceLetterFieldsRequest experienceLetterFieldsRequest) throws EmployeeException {
        return serviceLetterService.downloadServiceLetter(request, experienceLetterFieldsRequest);
    }

    @RequestMapping(value = "/{companyName}/experienceletter/employee/{employeeId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getExperienceLetterByEmployeeId.tag}", description = "${api.getExperienceLetterByEmployeeId.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getExperienceLetterByEmployeeId(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyName,
            @PathVariable String employeeId) throws EmployeeException {

        Collection<ExperienceEntity> experienceEntities = serviceLetterService.getExperienceLetter(companyName, employeeId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(experienceEntities), HttpStatus.OK);
    }

    @PatchMapping(value = "/employee/{employeeId}/experience")
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateExperienceLetterByEmployeeId.tag}", description = "${api.updateExperienceLetterByEmployeeId.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateExperienceByEmployeeId(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String employeeId,
            @Valid @RequestBody ExperienceLetterFieldsUpdateRequest experienceLetterFieldsUpdateRequest) throws EmployeeException, IOException {

        return serviceLetterService.updateExperienceById(employeeId, experienceLetterFieldsUpdateRequest);
    }

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getPayslip.tag}", description = "${api.getPayslip.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadExperienceLetter(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @RequestBody ExperienceLetterRequest request) {
        return serviceLetterService.uploadExperienceLetter(request);
    }
}
