package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.UserRequest;
import com.invoice.service.UserService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.createUser.tag}", description = "${api.createUser.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully")
    public ResponseEntity<?> createUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                        @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @RequestBody @Valid UserRequest userRequest) throws InvoiceException {

        return userService.createUser(userRequest);
    }

    @GetMapping("/{userId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getUser.tag}", description = "${api.getUser.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                    @PathVariable Long userId) throws InvoiceException {
        return userService.getUser(userId);
    }

    @GetMapping("/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getAllUsers.tag}", description = "${api.getAllUsers.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllUsers(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                         @RequestHeader(Constants.AUTH_KEY) String authToken) throws InvoiceException {

        return userService.getAllUsers();
    }

    @PatchMapping("/{userId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.updateUser.tag}", description = "${api.updateUser.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User updated successfully")
    public ResponseEntity<?> updateUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                       @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @PathVariable Long userId, @RequestBody @Valid UserRequest userRequest) throws InvoiceException {

        return userService.updateUser(userId, userRequest);
    }

    @DeleteMapping("/{userId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.deleteUser.tag}", description = "${api.deleteUser.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User deleted successfully")
    public ResponseEntity<?> deleteUser(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                        @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @PathVariable Long userId) throws InvoiceException {

        return userService.deleteUser(userId);
    }
}
