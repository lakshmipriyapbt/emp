package com.invoice.util;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.ProductModel;
import com.invoice.request.ProductRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;


public class ProductUtils {

    private ProductUtils() {
    }

    public static BigDecimal parseToBigDecimal(String value) {
        return value != null && !value.isEmpty() ? new BigDecimal(value) : BigDecimal.ZERO;
    }

    public static ProductModel populateProductFromRequest(ProductRequest productRequest) {
        ProductModel product = new ProductModel();
        BeanUtils.copyProperties(productRequest, product);
        return product;
    }
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void updateProductFromRequest(ProductModel productToUpdate, ProductRequest productRequest) throws JsonMappingException, InvoiceException {
        if (productRequest == null) {
            throw new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_NULL.getMessage(), HttpStatus.NOT_FOUND);
        }
        OBJECT_MAPPER.updateValue(productToUpdate, productRequest);
    }
}

