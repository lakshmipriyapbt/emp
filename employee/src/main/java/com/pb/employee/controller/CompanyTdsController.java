package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.TDSPayload.TDSCreatePayload;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import com.pb.employee.request.TDSPayload.TDSUpdatePayload;
import com.pb.employee.service.TDSService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/company")
public class CompanyTdsController {

    @Autowired
    private TDSService tdsService;

    @RequestMapping(value = "/{companyName}/tds", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.createCompanyTDS.tag}", description = "${api.createCompanyTDS.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> createCompanyTDS(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                   @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                   @Parameter(required = true, description = "${api.createCompanyTDSPayload.description}")
                                                   @PathVariable String companyName,
                                                   @RequestBody @Valid TDSCreatePayload createPayload) throws EmployeeException {
        return tdsService.createCompanyTDS(companyName,createPayload);
    }

    @RequestMapping(value = "/{companyName}/tds/{id}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanyTDSById.tag}", description = "${api.getCompanyTDSById.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyTDSById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          @PathVariable String companyName,
                                          @PathVariable String id) throws EmployeeException {
        Collection<TDSResPayload> tds =  tdsService.getCompanyTDS(companyName, id, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(tds), HttpStatus.OK);
    }


    @RequestMapping(value = "/{companyName}/tds", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanyTDS.tag}", description = "${api.getCompanyTDS.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyTDS(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyName, @RequestParam(required = false) String tdsType) throws EmployeeException {
        Collection<TDSResPayload> tds =  tdsService.getCompanyTDS(companyName, null, tdsType);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(tds), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/tds/{id}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateCompanyTDS.tag}", description = "${api.updateCompanyTDS.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,
                                               @PathVariable String id,
                                               @RequestBody @Valid TDSUpdatePayload updateRequest) throws EmployeeException {
        return tdsService.updateCompanyTDS(companyName, id, updateRequest);
    }


    @RequestMapping(value = "/{companyName}/tds/{id}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteCompanyTDS.tag}", description = "${api.deleteCompanyTDS.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteCompanyTDS(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,
                                                @PathVariable String id) throws EmployeeException {
        tdsService.deleteCompanyTDS(companyName,id);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/tds/{year}/year", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getYearCompanyTDS.tag}", description = "${api.getYearCompanyTDS.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyYearTDS(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                     @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                     @PathVariable String companyName,
                                                     @PathVariable String year,
                                                     @RequestParam(required = false) String tdsType) throws EmployeeException {

        TDSResPayload tdsResPayload =  tdsService.getCompanyYearTDS(companyName, year, tdsType);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(tdsResPayload), HttpStatus.OK);
    }
}
