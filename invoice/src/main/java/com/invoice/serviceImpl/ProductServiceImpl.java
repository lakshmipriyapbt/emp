package com.invoice.serviceImpl;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.invoice.config.Config;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.CompanyEntity;
import com.invoice.model.ProductModel;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.repository.ProductRepository;
import com.invoice.request.ProductRequest;
import com.invoice.service.ProductService;
import com.invoice.common.ResponseBuilder;
import com.invoice.util.Constants;
import com.invoice.util.ProductUtils;
import com.invoice.util.ResourceIdUtils;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import static com.invoice.util.ProductUtils.parseToBigDecimal;

@Service
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;

    @Autowired
    public ProductServiceImpl(ProductRepository repository) {
        this.repository = repository;
    }

    @Autowired
    private Config config;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> createProduct(String companyId, @Valid ProductRequest productRequest) throws InvoiceException, IOException {
        log.debug("Creating product: {}", productRequest);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        try {
            String productId = ResourceIdUtils.generateProductResourceId(productRequest.getHsnNo(), companyId);

            // Step 2: Fetch all products for the given companyId
            List<ProductModel> products = repository.findByCompanyId(companyId); // Assuming you have a method to fetch all customers for a company

            // Step 3: Search for the customer with the provided customerId
            Optional<ProductModel> productOptional = products.stream()
                    .filter(product -> product.getProductId().equals(productId)) // Filter the customer by ID
                    .findFirst();

            if (productOptional.isPresent()) {
                log.error("Customer already exists with ID: {}", productId);
                // Return a response indicating that the customer already exists
                throw  new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.PRODUCT_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }
            ProductModel product = ProductUtils.populateProductFromRequest(productRequest);

            BigDecimal totalCost = calculateTotalCost(productRequest);
            product.setUnitCost(String.valueOf(totalCost));

            ProductModel maskedProduct = ProductUtils.maskProductProperties(productRequest, productId, totalCost, companyId);

            log.debug("Product to save: {}", maskedProduct);
             repository.save(maskedProduct);

            log.info("Product created successfully with ID: {}", productId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error occurred while creating product: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.CREATE_FAILED.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public BigDecimal calculateTotalCost(ProductRequest productRequest) {
        BigDecimal cost = parseToBigDecimal(productRequest.getProductCost());
        BigDecimal gstRate = parseToBigDecimal(productRequest.getGst()).divide(config.getPercent());
        BigDecimal gstAmount = cost.multiply(gstRate);
        return cost.add(gstAmount);
    }

    @Override
    public ResponseEntity<?> getProductById(String companyId, String productId) throws InvoiceException, IOException {
        log.info("Fetching product with ID: {}", productId);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        Optional<ProductModel> product = repository.findByCompanyIdAndProductId(companyId, productId);

        if (product.isPresent()) {
            ProductModel maskedProduct = product.get();

            ProductModel unmaskedProduct = ProductUtils.unmaskProductProperties(maskedProduct);

            return ResponseEntity.ok(unmaskedProduct);
        } else {
            log.error("Error: {} - Product not found for productId: {}", InvoiceErrorMessageKey.PRODUCT_NOT_FOUND, productId);
            throw new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> getAllProductsByCompanyId(String companyId) throws InvoiceException, IOException {
        log.info("Fetching all products for companyId: {}", companyId);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        try {
            // Fetch products from the repository by companyId
            List<ProductModel> products = repository.findByCompanyId(companyId);
            // Check if the product list is null or empty
            if (products == null || products.isEmpty()) {
                log.info("No products found in the database for companyId: {}", companyId);
                return ResponseEntity.ok(Collections.emptyList());
            }
            // Unmask product properties
            List<ProductModel> unmaskedProducts = products.stream()
                    .map(ProductUtils::unmaskProductProperties)
                    .collect(Collectors.toList());

            log.info("All products fetched successfully, total count: {}", unmaskedProducts.size());
            return ResponseEntity.ok(unmaskedProducts);
        } catch (Exception e) {
            log.error("An error occurred while fetching all products for companyId {}: {}", companyId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteProduct(String companyId,String productId) throws InvoiceException {
        log.info("Deleting product with ID: {}", productId);
        if (repository.existsByCompanyIdAndProductId(companyId,productId)) {
            repository.deleteByCompanyIdAndProductId(companyId,productId);
            log.info("All products fetched successfully, total count: {}");
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETE_SUCCESS), HttpStatus.OK);
        } else {
            log.error("Error: {} - Product not found for productId: {}", InvoiceErrorMessageKey.PRODUCT_NOT_FOUND, productId);
            throw new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateProduct(String companyId, String productId, @Valid ProductRequest productRequest) throws InvoiceException, IOException {
        log.info("Starting product update process for ID: {}", productId);
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }
        try {
            ProductModel productToUpdate = repository.findById(productId)
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));

            ProductUtils.updateProductFromRequest(productToUpdate, productRequest);

            BigDecimal totalCost = calculateTotalCost(productRequest);
            log.info("Calculated total cost: {}", totalCost);

            ProductModel maskedProduct = ProductUtils.maskProductProperties(productRequest, productId, totalCost, companyId);

            repository.save(maskedProduct);
            log.info("Product successfully updated with ID: {}", productId);
            return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS));
        } catch (InvoiceException | JsonMappingException e) {
            log.error("InvoiceException occurred during product update: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.ERROR_CREATING_PRODUCT),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}