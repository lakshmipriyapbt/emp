package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.ProductRequest;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

public interface ProductService {

    ResponseEntity<?> createProduct(ProductRequest productRequest) throws InvoiceException;

    ResponseEntity<?> getProduct(String productId) throws InvoiceException;

    ResponseEntity<?> getAllProducts() throws InvoiceException;

    ResponseEntity<?> deleteProduct(String productId) throws InvoiceException;

    ResponseEntity<?> updateProduct(String productId, ProductRequest productRequest) throws IOException, InvoiceException;
}
