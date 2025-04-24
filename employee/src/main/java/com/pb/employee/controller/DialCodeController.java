package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.service.DialCodeService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("")
public class DialCodeController {

    @Autowired
    DialCodeService dialCodeService;

    @RequestMapping(value = "/dialcodes/list", method = RequestMethod.GET)
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getDialCodes.tag}", description = "${api.getDialCodes.description}")
    @ApiResponse(responseCode = "200", description= "OK")
    public ResponseEntity<?> getDialCodes(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken) throws EmployeeException {
        return dialCodeService.getDialCodes();
    }


}
