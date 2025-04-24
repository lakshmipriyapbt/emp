package com.pb.employee.controller;


import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.DesignationEntity;
import com.pb.employee.request.DesignationRequest;
import com.pb.employee.request.DesignationUpdateRequest;
import com.pb.employee.service.DesignationService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class DesignationController {

    @Autowired
    private DesignationService designationService;
    @RequestMapping(value = "/department/{departmentId}/designation", method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.registerDesignation.tag}", description = "${api.registerDesignation.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> registerDesignation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                 @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                 @Parameter(required = true, description = "${api.registerDesignationPayload.description}")
                                                 @RequestBody @Valid DesignationRequest designationRequest,
                                                 @PathVariable String departmentId) throws EmployeeException, IOException {
        return designationService.registerDesignation(designationRequest, departmentId);
    }

    @RequestMapping(value = "/{companyName}/designations", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDesignation.tag}", description = "${api.getDesignation.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDesignation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyName) throws EmployeeException {
        return designationService.getDesignation(companyName);
    }

    @RequestMapping(value = "/{companyName}/department/{departmentId}/designation/{designationId}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDesignation.tag}", description = "${api.getDesignation.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDesignationsByDepartment(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName, @PathVariable String departmentId, @PathVariable String designationId) throws EmployeeException {
        List<DesignationEntity> designationEntities = designationService.getDesignationsByDepartment(companyName, departmentId,  designationId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(designationEntities), HttpStatus.OK);    }

    @RequestMapping(value = "/{companyName}/department/{departmentId}/designation", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getDesignation.tag}", description = "${api.getDesignation.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDepartmentDesignations(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName, @PathVariable String departmentId) throws EmployeeException {
        List<DesignationEntity> designationEntities = designationService.getDesignationsByDepartment(companyName, departmentId,  null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(designationEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/department/{departmentId}/designation/{designationId}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateDesignation.tag}", description = "${api.updateDesignation.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateDesignationById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                   @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                   @PathVariable String designationId,
                                                   @PathVariable String departmentId,
                                                   @RequestBody @Valid DesignationUpdateRequest departmentUpdateRequest) throws EmployeeException {
        return designationService.updateDesignationById(designationId, departmentId, departmentUpdateRequest);
    }
    @RequestMapping(value = "/{companyName}/department/{departmentId}/designation/{designationId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteDesignation.tag}", description = "${api.deleteCompany.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteDesignation(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,
                                               @PathVariable String departmentId,
                                               @PathVariable String designationId) throws EmployeeException {
        return designationService.deleteDesignation(companyName, departmentId, designationId);
    }
}