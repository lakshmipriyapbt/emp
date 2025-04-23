package com.pb.employee.controller;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarRequest;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarResponse;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarUpdateRequest;
import com.pb.employee.service.CompanyCalenderService;
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
public class CompanyCalendarController {

    @Autowired
    private CompanyCalenderService companyService;

    @RequestMapping(value = "/{companyName}/calendar", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.createCompanyCalendar.tag}", description = "${api.createCompanyCalendar.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description= "CREATED")
    public ResponseEntity<?> createCompanyCalendar(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                             @RequestHeader(Constants.AUTH_KEY) String authToken,
                                             @Parameter(required = true, description = "${api.createCompanyCalendarPayload.description}")
                                             @PathVariable String companyName,
                                             @RequestBody @Valid CompanyCalendarRequest companyRequest) throws EmployeeException {
        return companyService.createCompanyCalendar(companyName,companyRequest);
    }

    @RequestMapping(value = "/{companyName}/calendar", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanyCalendar.tag}", description = "${api.getCompanyCalendar.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanies(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          @PathVariable String companyName) throws EmployeeException {
        Collection<CompanyCalendarEntity> calendarEntities =  companyService.getCompanyCalender(companyName, null);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(calendarEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/calendar/{id}", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getCompanyCalendarById.tag}", description = "${api.getCompanyCalendarById.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyName,
                                            @PathVariable String id) throws EmployeeException {
        Collection<CompanyCalendarEntity> calendarEntities =  companyService.getCompanyCalender(companyName, id);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(calendarEntities), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/calendar/{id}", method = RequestMethod.PATCH,consumes = MediaType.APPLICATION_JSON_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.updateCompanyCalendar.tag}", description = "${api.updateCompanyCalendar.description}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "202", description= "Accepted")
    public ResponseEntity<?> updateCompanyById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                               @RequestHeader(Constants.AUTH_KEY) String authToken,
                                               @PathVariable String companyName,
                                               @PathVariable String id,
                                               @RequestBody @Valid CompanyCalendarUpdateRequest updateRequest) throws EmployeeException {
        return companyService.updateCompanyCalendar(companyName, id, updateRequest);
    }


    @RequestMapping(value = "/{companyName}/employee/{calendarId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.deleteCompanyCalendar.tag}", description = "${api.deleteCompanyCalendar.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> deleteEmployeeById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                @PathVariable String companyName,
                                                @PathVariable String calendarId) throws EmployeeException {
        companyService.deleteCompanyCalendar(companyName,calendarId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);
    }

    @RequestMapping(value = "/{companyName}/calendar/today", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY) },
            summary = "${api.getTodayCompanyCalendar.tag}", description = "${api.getCompanyCalendar.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getTodayCompanyCalender(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @PathVariable String companyName) throws EmployeeException {
        CompanyCalendarResponse calendarEntities =  companyService.getTodayCompanyCalender(companyName);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(calendarEntities), HttpStatus.OK);
    }
}
