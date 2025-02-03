package com.invoice.controller;

import com.invoice.exception.InvoiceException;
import com.invoice.request.ProductRequest;
import com.invoice.service.ProductService;
import com.invoice.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("company/{companyId}/product")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.createProduct.tag}", description = "${api.createProduct.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "OK")
    public ResponseEntity<?> createProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                          @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @Parameter(required = true, description = "${api.createProductPayload.description}")
                                           @PathVariable String companyId,
                                           @RequestBody @Valid ProductRequest productRequest) throws InvoiceException, IOException {
        return productService.createProduct(companyId,productRequest);
    }

    @GetMapping("company/{companyId}/product/{productId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getProduct.tag}", description = "${api.getProduct.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getProductById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                        @RequestHeader(Constants.AUTH_KEY) String authToken,
                                        @PathVariable String companyId,
                                        @PathVariable String productId) throws InvoiceException, IOException {
        return productService.getProductById(companyId,productId);
    }

    @GetMapping("company/{companyId}/product/all")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.getAllProducts.tag}", description = "${api.getAllProducts.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> getAllProductsByCompanyId(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                       @PathVariable String companyId) throws InvoiceException, IOException {
        return productService.getAllProductsByCompanyId(companyId);
    }

    @PatchMapping("company/{companyId}/product/{productId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.updateProduct.tag}", description = "${api.updateProduct.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> updateProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyId,
                                           @PathVariable String productId,
                                           @RequestBody @Valid ProductRequest productRequest) throws InvoiceException, IOException {
        return productService.updateProduct(companyId,productId, productRequest);
    }

    @DeleteMapping("company/{companyId}/product/{productId}")
    @Operation(security = { @SecurityRequirement(name = Constants.AUTH_KEY) },summary = "${api.deleteProduct.tag}", description = "${api.deleteProduct.description}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<?> deleteProduct(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                           @RequestHeader(Constants.AUTH_KEY) String authToken,
                                           @PathVariable String companyId,
                                           @PathVariable String productId) throws InvoiceException {
        return productService.deleteProduct(companyId,productId);
    }
}
