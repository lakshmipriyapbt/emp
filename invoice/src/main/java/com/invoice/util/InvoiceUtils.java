package com.invoice.util;

import com.invoice.config.Config;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.repository.ProductRepository;
import com.invoice.request.InvoiceRequest;
import com.invoice.request.OrderRequest;
import com.invoice.response.InvoiceResponse;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static com.invoice.util.ProductUtils.unmaskProductProperties;

public class InvoiceUtils {

    public static InvoiceModel initializeInvoice(InvoiceRequest request, CustomerModel customer, String companyId, String customerId) {
        String customerName = null;

        // Unmasking the properties by decoding the Base64 encoded values
        if (customer.getCustomerName() != null) {
            customerName = new String(Base64.getDecoder().decode(customer.getCustomerName()));
        }
        InvoiceModel invoice = new InvoiceModel();
        invoice.setCustomerId(customerId);
        invoice.setPurchaseOrder(request.getPurchaseOrder());
        invoice.setVendorCode(request.getVendorCode());
        invoice.setInvoiceDate(String.valueOf(request.getInvoiceDate()));
        invoice.setStatus(request.getStatus());
        invoice.setDueDate(request.getDueDate());
        invoice.setCompanyId(companyId);
        return invoice;
    }

    public static List<OrderModel> processOrders(List<OrderRequest> orderRequests, InvoiceModel invoice,
                                                 ProductRepository productRepository) throws InvoiceException {
        List<OrderModel> orders = new ArrayList<>();

        for (OrderRequest orderRequest : orderRequests) {
            // Fetch the product from repository
            ProductModel product = productRepository.findById(orderRequest.getProductId())
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));

            // Unmask product properties if necessary
            product = unmaskProductProperties(product);

            // Calculate total cost using the quantity from the OrderRequest and the unit cost of the product
            BigDecimal quantity = new BigDecimal(orderRequest.getQuantity());
            String cost = product.getUnitCost();
            BigDecimal totalCost = quantity.multiply(new BigDecimal(cost));

            // Create an OrderModel instance and set properties
            OrderModel order = new OrderModel();
            order.setProduct(product);
            order.setPurchaseDate(orderRequest.getPurchaseDate());
            order.setQuantity(orderRequest.getQuantity().toString());
            order.setCost(cost.toString());
            order.setTotalCost(String.valueOf(totalCost));
            order.setInvoiceModel(invoice);

            // Add the masked order to the list
            orders.add(order);
        }

        return orders;
    }

    public static BigDecimal calculateTotalAmount(List<OrderModel> orders) {
        return orders.stream()
                .map(order -> new BigDecimal(order.getTotalCost()))  // Convert String to BigDecimal
                .reduce(BigDecimal.ZERO, BigDecimal::add);  // Sum the BigDecimal values
    }

    private static String extractStateCode(String gstNumber) {
        if (gstNumber == null || gstNumber.length() < 2) {
            return null;
        }
        return gstNumber.substring(0, 2);
    }

    public static void calculateGstAndGrandTotal(InvoiceModel invoice, CompanyEntity company, CustomerModel customer,
                                                 BigDecimal totalAmount, Config config) {

        String companyStateCode = extractStateCode(company.getGstNo());
        String customerStateCode = extractStateCode(customer.getGstNo());
        BigDecimal gstRate = config.getRate();
        BigDecimal gstAmount;
        // Check if customer GST number is null or empty
        String customerGstNo = customer.getGstNo();
        if (customerGstNo == null || customerGstNo.trim().isEmpty()) {
            invoice.setGst(Constants.ZERO);
            invoice.setCGst(Constants.ZERO);
            invoice.setSGst(Constants.ZERO);
            invoice.setIGst(Constants.ZERO);
            invoice.setGrandTotal(String.valueOf(totalAmount));
            return;
        }
        // Determine GST values based on state codes
        if (Objects.equals(companyStateCode, customerStateCode)) {
            gstAmount = totalAmount.multiply(gstRate).divide(config.getValue());
            invoice.setCGst(gstAmount.toString());
            invoice.setSGst(gstAmount.toString());
            invoice.setIGst(Constants.ZERO);
            invoice.setGst(Constants.ZERO);
        } else {
            gstAmount = totalAmount.multiply(gstRate);
            invoice.setCGst(Constants.ZERO);
            invoice.setSGst(Constants.ZERO);
            invoice.setGst(Constants.ZERO);
            invoice.setIGst(gstAmount.toString());
        }
        BigDecimal grandTotal = totalAmount.add(gstAmount);
        invoice.setGrandTotal(String.valueOf(grandTotal));
    }

    public static InvoiceModel encodeInvoiceData(InvoiceModel invoice) {

        if (invoice.getCGst() != null) {
            invoice.setCGst(Base64.getEncoder().encodeToString(invoice.getCGst().getBytes()));
        }
        if (invoice.getGst() != null) {
            invoice.setGst(Base64.getEncoder().encodeToString(invoice.getGst().getBytes()));
        }
        if (invoice.getSGst() != null) {
            invoice.setSGst(Base64.getEncoder().encodeToString(invoice.getSGst().getBytes()));
        }
        if (invoice.getIGst() != null) {
            invoice.setIGst(Base64.getEncoder().encodeToString(invoice.getIGst().getBytes()));
        }
        if (invoice.getTotalAmount() != null) {
            invoice.setTotalAmount(Base64.getEncoder().encodeToString(invoice.getTotalAmount().getBytes()));
        }

        if (invoice.getGrandTotal() != null) {
            String grandTotalAsString = invoice.getGrandTotal().toString();
            String encodedGrandTotal = Base64.getEncoder().encodeToString(grandTotalAsString.getBytes(StandardCharsets.UTF_8));
            invoice.setGrandTotal((encodedGrandTotal));
        }
        if (invoice.getGrandTotalInWords() != null) {
            invoice.setGrandTotalInWords(Base64.getEncoder().encodeToString(invoice.getGrandTotalInWords().getBytes()));
        }
        // Encode all order data if needed
        if (invoice.getOrderModels() != null) {
            for (OrderModel order : invoice.getOrderModels()) {
                if (order.getQuantity() != null) {
                    order.setQuantity(Base64.getEncoder().encodeToString(order.getQuantity().getBytes()));
                }
                if (order.getCost() != null) {
                    order.setCost(Base64.getEncoder().encodeToString(order.getCost().getBytes()));
                }
                if (order.getTotalCost() != null) {
                    String totalCostAsString = order.getTotalCost().toString();
                    String encodedTotalCost = Base64.getEncoder().encodeToString(totalCostAsString.getBytes(StandardCharsets.UTF_8));
                    order.setTotalCost((encodedTotalCost));
                }
            }
        }
        return invoice;
    }

    public static InvoiceResponse fromEntities(CompanyEntity companyEntity, CustomerModel customerModel, InvoiceModel invoiceModel, List<BankEntity> bankEntities) {
        // Map all bank details
        List<InvoiceResponse.BankDetailResponse> bankDetails = bankEntities.stream()
                .map(bank -> InvoiceResponse.BankDetailResponse.builder()
                        .bankName(bank.getBankName())
                        .accountNumber(bank.getAccountNumber())
                        .accountType(bank.getAccountType())
                        .branch(bank.getBranch())
                        .ifscCode(bank.getIfscCode())
                        .bankAddress(bank.getAddress())
                        .build())
                .toList();
        // Map all order details
        List<InvoiceResponse.OrderDetailResponse> orderDetails = invoiceModel.getOrderModels().stream()
                .map(order -> InvoiceResponse.OrderDetailResponse.builder()
                        .productName(order.getProduct().getProductName())
                        .hsnNo(order.getProduct().getHsnNo())
                        .service(order.getProduct().getService())
                        .quantity(order.getQuantity())
                        .unitCost(order.getCost())
                        .totalCost(order.getTotalCost())
                        .build())
                .toList();
        return InvoiceResponse.builder()
                .companyName(companyEntity.getCompanyName())
                .companyAddress(companyEntity.getCompanyAddress())
                .companyBranch(companyEntity.getCompanyBranch())
                .cinNo(companyEntity.getCinNo())
                .customerName(customerModel.getCustomerName())
                .customerEmail(customerModel.getEmail())
                .contactNumber(customerModel.getMobileNumber())
                .customerGstNo(customerModel.getGstNo())
                .gstNo(companyEntity.getGstNo())
                .customerAddress(customerModel.getAddress())
                .customerState(customerModel.getState())
                .customerCity(customerModel.getCity())
                .customerPinCode(customerModel.getPinCode())
                .invoiceDate(invoiceModel.getInvoiceDate().toString())
                .dueDate(invoiceModel.getDueDate().toString())
                .invoiceNumber(invoiceModel.getInvoiceId())
                .purchaseOrder(invoiceModel.getPurchaseOrder())
                .vendorCode(invoiceModel.getVendorCode())
                .status(invoiceModel.getStatus())
                .gst(invoiceModel.getGst())
                .cGst(invoiceModel.getCGst())
                .sGst(invoiceModel.getSGst())
                .iGst(invoiceModel.getIGst())
                .totalAmount(invoiceModel.getTotalAmount())
                .grandTotal(invoiceModel.getGrandTotal())
                .grandTotalInWords(invoiceModel.getGrandTotalInWords())
                .bankDetails(bankDetails)
                .orderDetails(orderDetails)
                .build();
    }

    public static InvoiceResponse decodeInvoiceResponse(InvoiceResponse invoiceResponse) {
        // Decode each field that may be Base64 encoded
        if (invoiceResponse.getCinNo() != null) {
            invoiceResponse.setCinNo(new String(Base64.getDecoder().decode(invoiceResponse.getCinNo()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerName() != null) {
            invoiceResponse.setCustomerName(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerName()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerEmail() != null) {
            invoiceResponse.setCustomerEmail(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerEmail()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getContactNumber() != null) {
            invoiceResponse.setContactNumber(new String(Base64.getDecoder().decode(invoiceResponse.getContactNumber()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getGstNo() != null) {
            invoiceResponse.setGstNo(new String(Base64.getDecoder().decode(invoiceResponse.getGstNo()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerGstNo() != null) {
            invoiceResponse.setCustomerGstNo(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerGstNo()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerAddress() != null) {
            invoiceResponse.setCustomerAddress(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerAddress()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerState() != null) {
            invoiceResponse.setCustomerState(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerState()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerCity() != null) {
            invoiceResponse.setCustomerCity(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerCity()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCustomerPinCode() != null) {
            invoiceResponse.setCustomerPinCode(new String(Base64.getDecoder().decode(invoiceResponse.getCustomerPinCode()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getGrandTotal() != null) {
            invoiceResponse.setGrandTotal(new String(Base64.getDecoder().decode(invoiceResponse.getGrandTotal()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getGrandTotalInWords() != null) {
            invoiceResponse.setGrandTotalInWords(new String(Base64.getDecoder().decode(invoiceResponse.getGrandTotalInWords()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getTotalAmount() != null) {
            invoiceResponse.setTotalAmount(new String(Base64.getDecoder().decode(invoiceResponse.getTotalAmount()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getGst() != null) {
            invoiceResponse.setGst(new String(Base64.getDecoder().decode(invoiceResponse.getGst()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getCGst() != null) {
            invoiceResponse.setCGst(new String(Base64.getDecoder().decode(invoiceResponse.getCGst()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getSGst() != null) {
            invoiceResponse.setSGst(new String(Base64.getDecoder().decode(invoiceResponse.getSGst()), StandardCharsets.UTF_8));
        }
        if (invoiceResponse.getIGst() != null) {
            invoiceResponse.setIGst(new String(Base64.getDecoder().decode(invoiceResponse.getIGst()), StandardCharsets.UTF_8));
        }
        // Decode the list of bank details and order details if present
        if (invoiceResponse.getBankDetails() != null) {
            for (InvoiceResponse.BankDetailResponse bankDetail : invoiceResponse.getBankDetails()) {
                if (bankDetail.getBankName() != null) {
                    bankDetail.setBankName(new String(Base64.getDecoder().decode(bankDetail.getBankName()), StandardCharsets.UTF_8));
                }
                if (bankDetail.getAccountNumber() != null) {
                    bankDetail.setAccountNumber(new String(Base64.getDecoder().decode(bankDetail.getAccountNumber()), StandardCharsets.UTF_8));
                }
                if (bankDetail.getAccountType() != null) {
                    bankDetail.setAccountType(new String(Base64.getDecoder().decode(bankDetail.getAccountType()), StandardCharsets.UTF_8));
                }
                if (bankDetail.getBranch() != null) {
                    bankDetail.setBranch(new String(Base64.getDecoder().decode(bankDetail.getBranch()), StandardCharsets.UTF_8));
                }
                if (bankDetail.getIfscCode() != null) {
                    bankDetail.setIfscCode(new String(Base64.getDecoder().decode(bankDetail.getIfscCode()), StandardCharsets.UTF_8));
                }
                if (bankDetail.getBankAddress() != null) {
                    bankDetail.setBankAddress(new String(Base64.getDecoder().decode(bankDetail.getBankAddress()), StandardCharsets.UTF_8));
                }
            }
        }

        if (invoiceResponse.getOrderDetails() != null) {
            for (InvoiceResponse.OrderDetailResponse orderDetail : invoiceResponse.getOrderDetails()) {
                if (orderDetail.getProductName() != null) {
                    orderDetail.setProductName(new String(Base64.getDecoder().decode(orderDetail.getProductName()), StandardCharsets.UTF_8));
                }
                if (orderDetail.getHsnNo() != null) {
                    orderDetail.setHsnNo(new String(Base64.getDecoder().decode(orderDetail.getHsnNo()), StandardCharsets.UTF_8));
                }
                if (orderDetail.getQuantity() != null) {
                    orderDetail.setQuantity(new String(Base64.getDecoder().decode(orderDetail.getQuantity()), StandardCharsets.UTF_8));
                }
                if (orderDetail.getUnitCost() != null) {
                    orderDetail.setUnitCost(new String(Base64.getDecoder().decode(orderDetail.getUnitCost()), StandardCharsets.UTF_8));
                }
                if (orderDetail.getTotalCost() != null) {
                    orderDetail.setTotalCost(new String(Base64.getDecoder().decode(orderDetail.getTotalCost()), StandardCharsets.UTF_8));
                }
                if (orderDetail.getService() != null) {
                    orderDetail.setService(new String(Base64.getDecoder().decode(orderDetail.getService()), StandardCharsets.UTF_8));
                }
            }
        }
        return invoiceResponse;
    }
}