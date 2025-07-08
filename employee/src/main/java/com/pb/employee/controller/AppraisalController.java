package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.AppraisalEntity;
import com.pb.employee.request.AppraisalLetterRequest;
import com.pb.employee.request.AppraisalUpdateRequest;
import com.pb.employee.response.UserResponse;
import com.pb.employee.service.AppraisalLetterService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class AppraisalController {

    @Autowired
    private AppraisalLetterService appraisalLetterService;


    @RequestMapping(value = "/appraisal/upload", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAppraisalLetter.tag}", description = "${api.getAppraisalLetter.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<byte[]> downloadAppraisalLetter(@Parameter(hidden = true, required = true,
            description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                  @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                  @RequestBody @Valid AppraisalLetterRequest appraisalLetterRequest,
                                                  HttpServletRequest request) throws EmployeeException {
        return appraisalLetterService.downloadAppraisalLetter(appraisalLetterRequest, request);
    }

    @RequestMapping(value = "/{companyId}/appraisal/employee/{employeeId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getAppraisalLetterByEmployeeId.tag}", description = "${api.getAppraisalLetterByEmployeeId.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAppraisalLetterByEmployeeId(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyId,
            @PathVariable String employeeId) throws Exception {
        return new ResponseEntity<>(appraisalLetterService.getAppraisalLetter(companyId, employeeId), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyId}/appraisal/employee/{employeeId}/{Id}", method = RequestMethod.PATCH)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.updateAppraisalLetter.tag}", description = "${api.updateAppraisalLetter.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateAppraisalLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyId,
            @PathVariable String employeeId,
            @PathVariable String Id,
            @RequestBody @Valid AppraisalUpdateRequest appraisalLetterRequest) throws Exception {

        return appraisalLetterService.updateAppraisalLetter(companyId, employeeId,Id,appraisalLetterRequest);
    }

    @RequestMapping(value = "/{companyId}/appraisal/employee/{employeeId}/{Id}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deleteAppraisalLetter.tag}", description = "${api.deleteAppraisalLetter.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteAppraisalLetter(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
            @RequestHeader(Constants.AUTH_KEY) String authToken,
            @PathVariable String companyId,
            @PathVariable String employeeId,
            @PathVariable String Id) throws EmployeeException {

        return appraisalLetterService.deleteAppraisalLetter(companyId, employeeId, Id);
    }

}
