package com.invoice.util;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.config.NumberToWordsConverter;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.request.CustomerRequest;
import com.invoice.request.InvoiceRequest;
import com.invoice.request.ProductColumnsRequest;
import com.invoice.request.ShippedPayload;
import com.invoice.response.InvoiceResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static org.bouncycastle.asn1.x500.style.RFC4519Style.c;


@Slf4j
public class InvoiceUtils {

    @Autowired
    private static OpenSearchOperations openSearchOperations;

    public static InvoiceModel maskInvoiceProperties(InvoiceRequest request, String invoiceId, String invoiceNo, CompanyEntity companyEntity, CustomerModel customerModel,BankEntity bankEntity) throws InvoiceException {
        ObjectMapper objectMapper = new ObjectMapper();

        // Convert the InvoiceRequest to InvoiceModel
        InvoiceModel entity = objectMapper.convertValue(request, InvoiceModel.class);

        // Validate product details
        if (request.getProductData() == null || request.getProductData().isEmpty()) {
            throw new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.BAD_REQUEST);
        }

        // ✅ Validate productColumns (Ensure no empty or null values)
        if (request.getProductColumns() == null || request.getProductColumns().isEmpty()) {
            throw new InvoiceException(InvoiceErrorMessageKey.PLEASE_ENTER_FIELD_NAME.getMessage(), HttpStatus.BAD_REQUEST);
        }

        for (ProductColumnsRequest column : request.getProductColumns()) {
            if (column.getKey() == null || column.getTitle().trim().isEmpty()) {
                throw new InvoiceException(InvoiceErrorMessageKey.PLEASE_ENTER_FIELD_NAME.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }
        // Set the necessary fields
        entity.setInvoiceId(invoiceId);
        entity.setType(Constants.INVOICE);
        entity.setStatus(request.getStatus());
        entity.setCompanyId(companyEntity.getId());
        entity.setCustomerId(customerModel.getCustomerId());
        entity.setBankId(bankEntity.getBankId());
        entity.setInvoiceNo(invoiceNo);

        // Mask productData (List<Map<String, String>>)
        if (request.getProductData() != null) {
            List<Map<String, String>> maskedProductData = request.getProductData().stream()
                    .map(InvoiceUtils::maskMapValues) // Mask each map in the list
                    .collect(Collectors.toList());
            entity.setProductData(maskedProductData);
        }

        double subTotal = parseAmount(request.getSubTotal());
        double cGst = 0.0, sGst = 0.0, iGst = 0.0, grandTotal = subTotal;

        // Get GST numbers
        String companyGstNo = companyEntity.getGstNo();
        String customerGstNo = customerModel.getCustomerGstNo();

        // Validate GST numbers
        if (customerGstNo != null && !customerGstNo.isEmpty() && !customerGstNo.matches("^0+$")) {
            if (companyGstNo != null && companyGstNo.length() >= 2 && customerGstNo.length() >= 2) {
                // Compare first two digits
                if (companyGstNo.substring(0, 2).equals(customerGstNo.substring(0, 2))) {
                    cGst = subTotal * 0.09; // 9% CGST
                    sGst = subTotal * 0.09; // 9% SGST
                } else {
                    iGst = subTotal * 0.18; // 18% IGST
                }
            }
        }
        // Set calculated values back to entity
        entity.setCGst(formatAmount(cGst));
        entity.setSGst(formatAmount(sGst));
        entity.setIGst(formatAmount(iGst));
        // Mask productColumns (List<ProductColumnsRequest>)
        if (request.getProductColumns() != null) {
            List<ProductColumnsRequest> maskedColumns = request.getProductColumns().stream()
                    .map(InvoiceUtils::maskProductColumn)
                    .collect(Collectors.toList());
            entity.setProductColumns(maskedColumns);
        }

        if (request.getShippedPayload() != null) {
            List<ShippedPayload> maskedShippedPayload = request.getShippedPayload().stream()
                    .map(InvoiceUtils::maskShippedPayload)
                    .collect(Collectors.toList());
            entity.setShippedPayload(maskedShippedPayload);
        }

        // Mask other string fields
        entity.setInvoiceDate(maskValue(request.getInvoiceDate()));
        entity.setNotes(maskValue(request.getNotes()));
        entity.setDueDate(maskValue(request.getDueDate()));
        entity.setPurchaseOrder(maskValue(request.getPurchaseOrder()));
        entity.setVendorCode(maskValue(request.getVendorCode()));
        entity.setSubTotal(maskValue(request.getSubTotal()));

        return entity;
    }

    // Mask values in a Map<String, String>
    private static Map<String, String> maskMapValues(Map<String, String> data) {
        return data.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, // Keep the key as is
                        entry -> maskValue(entry.getValue()) // Mask the value
                ));
    }

    // Mask ProductColumnsRequest fields
    private static ProductColumnsRequest maskProductColumn(ProductColumnsRequest column) {
        return ProductColumnsRequest.builder()
                .key(maskValue(column.getKey()))
                .title(maskValue(column.getTitle()))
                .type(maskValue(column.getType()))
                .build();
    }

    private static ShippedPayload maskShippedPayload(ShippedPayload shippedPayload) {
        return ShippedPayload.builder()
                .customerName(maskValue(shippedPayload.getCustomerName()))
                .address(maskValue(shippedPayload.getAddress()))
                .mobileNumber(maskValue(shippedPayload.getMobileNumber()))
                .build();
    }

    // Masking logic (Base64 encoding)
    private static String maskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    public static CustomerModel unMaskCustomerProperties(CustomerModel customerModel) {
        if (customerModel != null) {
            log.debug("Unmasking customer: {}", customerModel);
            customerModel.setCustomerName(unMaskValue(customerModel.getCustomerName()));
            customerModel.setCustomerGstNo(unMaskValue(customerModel.getCustomerGstNo()));
            customerModel.setAddress(unMaskValue(customerModel.getAddress()));
            customerModel.setCity(unMaskValue(customerModel.getCity()));
            customerModel.setState(unMaskValue(customerModel.getState()));
            customerModel.setStateCode(unMaskValue(customerModel.getStateCode()));
            customerModel.setPinCode(unMaskValue(customerModel.getPinCode()));
            customerModel.setMobileNumber(unMaskValue(customerModel.getMobileNumber()));
            customerModel.setEmail(unMaskValue(customerModel.getEmail()));
        }
        return customerModel;
    }

    public static CompanyEntity unMaskCompanyProperties(CompanyEntity companyEntity,HttpServletRequest request) {
        if (companyEntity != null) {
            log.debug("Unmasking company: {}", companyEntity);
            companyEntity.setGstNo(unMaskValue(companyEntity.getGstNo()));
            companyEntity.setPanNo(unMaskValue(companyEntity.getPanNo()));
            companyEntity.setMobileNo(unMaskValue(companyEntity.getMobileNo()));
            companyEntity.setCinNo(unMaskValue(companyEntity.getCinNo()));
            String baseUrl = getBaseUrl(request);
            String image = baseUrl + "var/www/ems/assets/img/" + companyEntity.getImageFile();
            companyEntity.setImageFile(image);
            String stampImage = baseUrl + "var/www/ems/assets/img/" + companyEntity.getStampImage();
            companyEntity.setStampImage(stampImage);
        }
        return companyEntity;
    }

    public static BankEntity unMaskBankProperties(BankEntity bankEntity) {
        if (bankEntity != null) {
            log.debug("Unmasking bank: {}", bankEntity);
            bankEntity.setAccountNumber(unMaskValue(bankEntity.getAccountNumber()));
            bankEntity.setAccountType(unMaskValue(bankEntity.getAccountType()));
            bankEntity.setBankName(unMaskValue(bankEntity.getBankName()));
            bankEntity.setBranch(unMaskValue(bankEntity.getBranch()));
            bankEntity.setIfscCode(unMaskValue(bankEntity.getIfscCode()));
            bankEntity.setAddress(unMaskValue(bankEntity.getAddress()));
        }
        return bankEntity;
    }

    public static void unMaskInvoiceProperties(InvoiceModel invoiceEntity) {
        if (invoiceEntity != null) {
            log.debug("Unmasking invoice: {}", invoiceEntity);

            if (invoiceEntity.getInvoiceId() != null) {
                invoiceEntity.setInvoiceId(invoiceEntity.getInvoiceId());
            }

            invoiceEntity.setInvoiceDate(unMaskValue(invoiceEntity.getInvoiceDate()));
            invoiceEntity.setDueDate(unMaskValue(invoiceEntity.getDueDate()));
            invoiceEntity.setPurchaseOrder(unMaskValue(invoiceEntity.getPurchaseOrder()));
            invoiceEntity.setVendorCode(unMaskValue(invoiceEntity.getVendorCode()));
            invoiceEntity.setSubTotal(unMaskValue(invoiceEntity.getSubTotal()));
            invoiceEntity.setInvoiceNo(invoiceEntity.getInvoiceNo());
            invoiceEntity.setNotes(unMaskValue(invoiceEntity.getNotes()));

            // Unmask productData (List<Map<String, String>>)
            if (invoiceEntity.getProductData() != null) {
                List<Map<String, String>> unmaskedProductData = invoiceEntity.getProductData().stream()
                        .map(productMap -> {
                            Map<String, String> unmaskedMap = new HashMap<>();
                            for (Map.Entry<String, String> entry : productMap.entrySet()) {
                                unmaskedMap.put(entry.getKey(), unMaskValue(entry.getValue()));
                            }
                            return unmaskedMap;
                        })
                        .collect(Collectors.toList());
                invoiceEntity.setProductData(unmaskedProductData);
            }

            // Unmask productColumns (List<ProductColumnsRequest>)
            if (invoiceEntity.getProductColumns() != null) {
                List<ProductColumnsRequest> unmaskedColumns = invoiceEntity.getProductColumns().stream()
                        .map(InvoiceUtils::unMaskProductColumn)
                        .collect(Collectors.toList());
                invoiceEntity.setProductColumns(unmaskedColumns);
            }
            if (invoiceEntity.getShippedPayload() != null) {
                List<ShippedPayload> unmaskedShippedPayload = invoiceEntity.getShippedPayload().stream()
                        .map(InvoiceUtils::unMaskShippedPayload)
                        .collect(Collectors.toList());
                invoiceEntity.setShippedPayload(unmaskedShippedPayload);
            }
        }
    }

    public static void calculateGrandTotal(InvoiceModel invoiceEntity, InvoiceResponse invoiceResponse) {
        double subTotal = parseAmount(invoiceEntity.getSubTotal());
        double grandTotal = subTotal;

        String cGstStr = invoiceEntity.getCGst();
        String sGstStr = invoiceEntity.getSGst();
        String iGstStr = invoiceEntity.getIGst();

        try {
            if (cGstStr != null && !cGstStr.equals("0.00") &&
                    sGstStr != null && !sGstStr.equals("0.00")) {

                double cGst = Double.parseDouble(cGstStr);
                double sGst = Double.parseDouble(sGstStr);
                grandTotal += cGst + sGst;

            } else if (iGstStr != null && !iGstStr.equals("0.00")) {
                double iGst = Double.parseDouble(iGstStr);
                grandTotal += iGst;

            } else if (cGstStr != null && sGstStr != null && iGstStr != null) {
                String companyGstNo = (invoiceResponse.getCompany() != null) ? invoiceResponse.getCompany().getGstNo() : null;
                String customerGstNo = (invoiceResponse.getCustomer() != null) ? invoiceResponse.getCustomer().getCustomerGstNo() : null;

                if (customerGstNo != null && !customerGstNo.isEmpty() && !customerGstNo.matches("^0+$")) {
                    if (companyGstNo != null && companyGstNo.length() >= 2 &&
                            customerGstNo.length() >= 2) {

                        if (companyGstNo.substring(0, 2).equals(customerGstNo.substring(0, 2))) {
                            double cGst = subTotal * 0.09;
                            double sGst = subTotal * 0.09;
                            invoiceEntity.setCGst(formatAmount(cGst));
                            invoiceEntity.setSGst(formatAmount(sGst));
                            invoiceEntity.setIGst("0.00");
                            grandTotal += cGst + sGst;
                        } else {
                            double iGst = subTotal * 0.18;
                            invoiceEntity.setIGst(formatAmount(iGst));
                            invoiceEntity.setCGst("0.00");
                            invoiceEntity.setSGst("0.00");
                            grandTotal += iGst;
                        }
                    }
                }
            }

            // Set grand total and total in words
            invoiceEntity.setGrandTotal(formatAmount(grandTotal));
            BigDecimal grandTotalValue = new BigDecimal(grandTotal);
            invoiceEntity.setGrandTotalInWords(NumberToWordsConverter.convert(grandTotalValue));

        } catch (NumberFormatException e) {
            log.error("Error parsing tax amounts: {}", e.getMessage(), e);
        }
    }

    /**
     * Formats a double value to two decimal places and converts it to a string.
     */
    private static String formatAmount(double amount) {
        return String.format("%.2f", amount);
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        int serverPort = request.getServerPort(); // port number
        String contextPath = "" + request.getContextPath(); // context path

        return scheme + "://" + serverName + ":" + serverPort + contextPath + "/";
    }

    /**
     * Parses a string amount into a double, handling nulls and invalid values.
     */
    private static double parseAmount(String amount) {
        if (amount == null || amount.trim().isEmpty()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(amount);
        } catch (NumberFormatException e) {
            log.error("Invalid amount format: {}", amount);
            return 0.0;

        }
    }

    /**
     * Method to unmask a ProductColumn.
     */
    private static ProductColumnsRequest unMaskProductColumn(ProductColumnsRequest column) {
        if (column != null) {
            column.setKey(unMaskValue(column.getKey()));
            column.setType(unMaskValue(column.getType()));
            column.setTitle(unMaskValue(column.getTitle()));
        }
        return column;
    }

    private static ShippedPayload unMaskShippedPayload(ShippedPayload shippedPayload) {
        if (shippedPayload != null) {
            shippedPayload.setCustomerName(unMaskValue(shippedPayload.getCustomerName()));
            shippedPayload.setAddress(unMaskValue(shippedPayload.getAddress()));
            shippedPayload.setMobileNumber(unMaskValue(shippedPayload.getMobileNumber()));
        }
        return shippedPayload;
    }

    /**
     * Base64 decoding method to unmask values.
     */
    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        byte[] decodedBytes = Base64.getDecoder().decode(value);
        return new String(decodedBytes, StandardCharsets.UTF_8); // Correctly decode without extra bytes conversion
    }

    public static String generateNextInvoiceNumber(String companyId, String shortName, OpenSearchOperations openSearchOperations) throws InvoiceException {
        // Fetch last invoice number from OpenSearch
        String lastInvoiceNo = openSearchOperations.findLastInvoiceNumber(companyId, shortName);

        // If no previous invoice exists, start with the first invoice of the financial year
        if (lastInvoiceNo == null || lastInvoiceNo.isEmpty()) {
            return generateFirstInvoiceNumber();
        }

        String[] parts = lastInvoiceNo.split("-");

        // Validate the format to avoid incorrect invoice numbers
        if (parts.length < 3) {
            log.error("Invalid invoice number format retrieved: {}", lastInvoiceNo);
            throw new InvoiceException(InvoiceErrorMessageKey.INVALID_INVOICE_ID_FORMAT.getMessage() + lastInvoiceNo, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            int nextNumber = Integer.parseInt(parts[2]) + 1;  // Increment last invoice number
            return parts[0] + "-" + parts[1] + "-" + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            log.error("Error parsing invoice number: {}", lastInvoiceNo, e);
            throw new InvoiceException("Error parsing invoice number: " + lastInvoiceNo, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public static String generateFirstInvoiceNumber() {
        LocalDate currentDate = LocalDate.now();
        int year = currentDate.getYear();
        int nextYear = (year + 1) % 100; // Get last two digits of next year
        int prevYear = year - 1;

        // Determine financial year (April - March cycle)
        String financialYear;
        if (currentDate.getMonthValue() < 4) { // If Jan, Feb, Mar → previous financial year
            financialYear = prevYear + "-" + String.format("%02d", year % 100);
        } else { // April onwards → current financial year
            financialYear = year + "-" + String.format("%02d", nextYear);
        }

        return financialYear + "-001"; // Example: 2024-25-001
    }
}
