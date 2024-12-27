package com.pb.employee.controller;

import com.pb.employee.request.*;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestController
@RequestMapping("/")
public class CustomerController {

    private static final Logger log = LoggerFactory.getLogger(CustomerController.class);
    private final WebClient webClient;

    @Autowired
    public CustomerController(WebClient.Builder webClientBuilder, @Value("${invoice.service.baseUrl}") String baseUrl) {
        log.info("${invoice.service.baseUrl}");
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @PostMapping("customer")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getCustomer.tag}", description = "${api.getCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer retrieved successfully")
    public ResponseEntity<?> login(
            @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                    @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                    @RequestBody @Valid CustomerRequest request) {
        try {
            return webClient.post()
                    .uri(Constants.CUSTOMER_ADD)// Path for the customer endpoint
                    .header(Constants.AUTH_KEY, authToken)  // Include token in request
                    .bodyValue(request)  // Request body (CustomerRequest)
                    .retrieve()
                    .toEntity(String.class)  // Response entity type
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @GetMapping("customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getCustomer.tag}", description = "${api.getCustomer.description}")
    @ApiResponse(responseCode = "200", description = "Customer retrieved successfully")
    public ResponseEntity<?> getCustomer( @Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                          @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                          @PathVariable String customerId) {
        try {
            return webClient.get()  // Use GET if you're just retrieving data
                    .uri(Constants.CUSTOMER + customerId)  // Append the customerId to the URI
                    .header(Constants.AUTH_KEY, authToken)  // Pass the authToken
                    .retrieve()
                    .toEntity(String.class)  // Expect a response of type String (adjust if it's different)
                    .block();
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }
    // Call to get all customers
    @GetMapping("customer/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) }, summary = "${api.getCustomer.tag}",
            description = "${api.getCustomer.description}")
    @ApiResponse(responseCode = "200", description = "Customers retrieved successfully")
    public ResponseEntity<?> getAllCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken) {
        try {
            // Use WebClient to call the external service
            return webClient.get()
                    .uri(Constants.CUSTOMER+Constants.ALL)  // URI to get all customers (Constants.ALL should be the correct path)
                    .header(Constants.AUTH_KEY, authToken)  // Pass the authorization token in the header
                    .retrieve()
                    .toEntity(String.class)  // Assuming the response is a String, adjust as needed
                    .block();  // Blocks until the response is received
        } catch (WebClientResponseException e) {
            // Handle error if the WebClient request fails
            return ResponseEntity.status(e.getRawStatusCode()).body(e.getResponseBodyAsString());
        }
    }


    @PatchMapping("customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateCustomer.tag}", description = "${api.updateCustomer.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer updated successfully")
    // Call to update a customer
    public ResponseEntity<?> updateCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                            @PathVariable String customerId,
                                            @RequestBody @Valid CustomerRequest customerRequest) {
        return webClient.patch()
                .uri(Constants.CUSTOMER + customerId)  // The customerId is part of the URI path
                .header(Constants.AUTH_KEY, authToken)  // Pass the authorization token
                .contentType(MediaType.APPLICATION_JSON)  // Ensure the content type is set to application/json
                .bodyValue(customerRequest)  // The body will contain the customerRequest JSON data
                .retrieve()
                .toEntity(String.class)  // Assuming the response is of type String
                .block();  // This will block the thread until the response is received
    }

    @DeleteMapping("customer/{customerId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteCustomer.tag}", description = "${api.deleteCustomer.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer deleted successfully")
    // Call to delete a customer
    public ResponseEntity<?> deleteCustomer(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @Parameter(required = true, description = "${api.createCustomerPayload.description}")
                                            @PathVariable String customerId) {
        return webClient.delete()
                .uri(Constants.CUSTOMER + customerId)  // The customerId is part of the URI path
                .header(Constants.AUTH_KEY, authToken)  // Pass the authorization token
                .retrieve()
                .toEntity(String.class)  // Assuming the response is of type String
                .block();  // This will block the thread until the response is received
    }
}
