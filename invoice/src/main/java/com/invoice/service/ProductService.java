package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.ProductRequest;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

public interface ProductService {

    ResponseEntity<?> createProduct(String companyId,ProductRequest productRequest) throws InvoiceException, IOException;

    ResponseEntity<?> getProductById(String companyId,String productId) throws InvoiceException, IOException;

    ResponseEntity<?> getAllProductsByCompanyId(String companyId) throws InvoiceException, IOException;

    ResponseEntity<?> deleteProduct(String companyId,String productId) throws InvoiceException;

    ResponseEntity<?> updateProduct(String companyId,String productId, ProductRequest productRequest) throws IOException, InvoiceException;
}
