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
import java.util.Base64;


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
    public static ProductModel maskProductProperties(ProductRequest productRequest, String id, BigDecimal unitCost, String companyId) {
        String productName = null, productCost = null, service = null, hsnNo = null, gst = null, encodedUnitCost = null;
        ObjectMapper objectMapper = new ObjectMapper();

        ProductModel productModel = objectMapper.convertValue(productRequest, ProductModel.class);

        if (productRequest.getProductName() != null) {
            productName = Base64.getEncoder().encodeToString(productRequest.getProductName().getBytes());
            productModel.setProductName(productName);
        }

        if (productRequest.getProductCost() != null) {
            productCost = Base64.getEncoder().encodeToString(productRequest.getProductCost().getBytes());
            productModel.setProductCost(productCost);
        }

        if (productRequest.getService() != null) {
            service = Base64.getEncoder().encodeToString(productRequest.getService().getBytes());
            productModel.setService(service);
        }

        if (productRequest.getHsnNo() != null) {
            hsnNo = Base64.getEncoder().encodeToString(productRequest.getHsnNo().getBytes());
            productModel.setHsnNo(hsnNo);
        }

        if (productRequest.getGst() != null) {
            gst = Base64.getEncoder().encodeToString(productRequest.getGst().getBytes());
            productModel.setGst(gst);
        }

        if (unitCost != null) {
            encodedUnitCost = Base64.getEncoder().encodeToString(unitCost.toString().getBytes());
            productModel.setUnitCost(encodedUnitCost); // Store as String
        }

        // Set companyId
        productModel.setCompanyId(companyId);
        productModel.setProductId(id != null ? (id) : null);
        return productModel;
    }


    public static ProductModel unmaskProductProperties(ProductModel maskedProduct) {
        ProductModel productModel = new ProductModel();

        if (maskedProduct.getProductName() != null) {
            String productName = new String(Base64.getDecoder().decode(maskedProduct.getProductName()));
            productModel.setProductName(productName);
        }

        if (maskedProduct.getProductCost() != null) {
            String productCost = new String(Base64.getDecoder().decode(maskedProduct.getProductCost()));
            productModel.setProductCost(productCost);
        }

        if (maskedProduct.getService() != null) {
            String service = new String(Base64.getDecoder().decode(maskedProduct.getService()));
            productModel.setService(service);
        }

        if (maskedProduct.getHsnNo() != null) {
            String hsnNo = new String(Base64.getDecoder().decode(maskedProduct.getHsnNo()));
            productModel.setHsnNo(hsnNo);
        }

        if (maskedProduct.getGst() != null) {
            String gst = new String(Base64.getDecoder().decode(maskedProduct.getGst()));
            productModel.setGst(gst);
        }

        if (maskedProduct.getUnitCost() != null) {
            String decodedUnitCost = new String(Base64.getDecoder().decode(maskedProduct.getUnitCost()));
            productModel.setUnitCost((decodedUnitCost)); // Convert back to BigDecimal
        }
        // Copy other non-masked properties
        productModel.setCompanyId(maskedProduct.getCompanyId());
        productModel.setProductId(maskedProduct.getProductId());
        return productModel;
    }
}