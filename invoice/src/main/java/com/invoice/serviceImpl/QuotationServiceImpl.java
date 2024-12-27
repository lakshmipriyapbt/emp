package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.repository.*;
import com.invoice.request.OrderRequest;
import com.invoice.request.QuotationRequest;
import com.invoice.response.QuotationResponse;
import com.invoice.service.QuotationService;
import com.invoice.util.Constants;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class QuotationServiceImpl implements QuotationService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Override
    @Transactional
    public ResponseEntity<?> saveQuotation(@Valid QuotationRequest request) throws InvoiceException {
        log.debug("Creating quotation: {}", request);
        try {
            Optional<CustomerModel> customerOpt = customerRepository.findByCustomerName(request.getCustomerName());
            if (customerOpt.isEmpty()) {
                log.error("Customer not found: {}", request.getCustomerName());
                return new ResponseEntity<>(ResponseBuilder.builder().build().failureResponse(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND.getMessage()), HttpStatus.BAD_REQUEST);
            }
            CustomerModel customer = customerOpt.get();
            List<QuotationOrderModel> quotationOrders = new ArrayList<>();
            BigDecimal totalCost = BigDecimal.ZERO;
            try {
                for (OrderRequest orderRequest : request.getOrderRequests()) {
                    ProductModel product = productRepository.findById(orderRequest.getProductId())
                            .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));
                    QuotationOrderModel orderModel = new QuotationOrderModel();
                    orderModel.setProduct(product);
                    orderModel.setPurchaseDate(LocalDate.parse(orderRequest.getPurchaseDate()));
                    orderModel.setQuantity(String.valueOf(orderRequest.getQuantity()));
                    BigDecimal orderCost = product.getUnitCost().multiply(new BigDecimal(orderRequest.getQuantity()));
                    orderModel.setCost(orderCost.toString());
                    totalCost = totalCost.add(orderCost);
                    quotationOrders.add(orderModel);
                }
            } catch (Exception e) {
                log.error("Unexpected error processing orders: {}", e.getMessage());
                throw new InvoiceException(InvoiceErrorMessageKey.ORDER_PROCESSING_FAILED.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            QuotationModel quotation = new QuotationModel();
            try {
                quotation.setCustomer(customer);
                quotation.setVendorCode(request.getVendorCode());
                quotation.setQuotationDate(request.getQuotationDate());
                quotation.setDueDate(request.getDueDate());
                quotation.setShippingDate(request.getShippingDate());
                quotation.setDeliveryDate(request.getDeliveryDate());
                quotation.setShippingAddress(request.getShippingAddress());
                quotation.setDeliveryAddress(request.getDeliveryAddress());
                quotation.setOrderModels(quotationOrders);
                quotation.setTotalAmount(totalCost);
            } catch (Exception e) {
                log.error("Error setting quotation fields: {}", e.getMessage());
                throw new InvoiceException(InvoiceErrorMessageKey.QUOTATION_CREATION_FAILED.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            try {
                for (QuotationOrderModel order : quotationOrders) {
                    order.setQuotationModel(quotation);
                }
                quotationRepository.save(quotation);
            } catch (Exception e) {
                log.error("Error saving quotation: {}", e.getMessage());
                throw new InvoiceException(InvoiceErrorMessageKey.QUOTATION_SAVE_FAILED.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            log.info("Quotation created successfully: {}", quotation.getQuotationId());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected error during quotation creation: {}", e.getMessage());
            throw new InvoiceException(InvoiceErrorMessageKey.UNEXPECTED_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getQuotation(String quotationId) throws InvoiceException {
        log.info("Fetching quotation with ID: {}", quotationId);
        try {
            Optional<QuotationModel> optionalQuotation = quotationRepository.findById(quotationId);
            QuotationModel quotation = optionalQuotation.get();
            Map<String, Object> response = new HashMap<>();
            response.put(Constants.CUSTOMER_NAME, quotation.getCustomer().getCustomerName());
            response.put(Constants.CUSTOMER_ID, quotation.getCustomer().getCustomerId());
            response.put(Constants.QUOTATION_ID, quotation.getQuotationId());
            response.put(Constants.TOTAL_AMOUNT, quotation.getTotalAmount());
            response.put(Constants.VENDOR_CODE, quotation.getVendorCode());
            response.put(Constants.QUOTATION_DATE, quotation.getQuotationDate());
            response.put(Constants.DUE_DATE, quotation.getDueDate());
            response.put(Constants.SHIPPING_DATE, quotation.getShippingDate());
            response.put(Constants.DELIVERY_DATE, quotation.getDeliveryDate());
            response.put(Constants.SHIPPING_ADDRESS, quotation.getShippingAddress());
            response.put(Constants.DELIVERY_ADDRESS, quotation.getDeliveryAddress());

            List<Map<String, Object>> orderRequests = quotation.getOrderModels().stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put(Constants.PRODUCT_ID, order.getProduct().getProductId());
                        orderMap.put(Constants.HSN_NO, order.getProduct().getHsnNo());
                        orderMap.put(Constants.PURCHASE_DATE, order.getPurchaseDate());
                        orderMap.put(Constants.QUANTITY, order.getQuantity());
                       // orderMap.put(Constants.COST, order.getCost());
                        return orderMap;
                    })
                    .collect(Collectors.toList());
            response.put(Constants.ORDER_REQUESTS, orderRequests);

            log.info("Quotation with ID: {} fetched successfully", quotationId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(response), HttpStatus.OK);
        } catch (Exception e) {
            log.error("An error occurred while fetching quotation: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.QUOTATION_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity<?> getAllQuotations() throws InvoiceException {
        log.info("Fetching all quotations");
        try {
            List<QuotationModel> quotations = quotationRepository.findAll();
            if (quotations == null || quotations.isEmpty()) {
                log.info("No quotations found in the database.");
                return ResponseEntity.ok(Collections.emptyList());
            }
            List<Map<String, Object>> responseList = quotations.stream().map(quotation -> {
                Map<String, Object> response = new HashMap<>();
                response.put(Constants.CUSTOMER_NAME, quotation.getCustomer().getCustomerName());
                response.put(Constants.CUSTOMER_ID, quotation.getCustomer().getCustomerId());
                response.put(Constants.QUOTATION_ID, quotation.getQuotationId());
                response.put(Constants.TOTAL_AMOUNT, quotation.getTotalAmount());
                response.put(Constants.VENDOR_CODE, quotation.getVendorCode());
                response.put(Constants.QUOTATION_DATE, quotation.getQuotationDate());
                response.put(Constants.DUE_DATE, quotation.getDueDate());
                response.put(Constants.SHIPPING_DATE, quotation.getShippingDate());
                response.put(Constants.DELIVERY_DATE, quotation.getDeliveryDate());
                response.put(Constants.SHIPPING_ADDRESS, quotation.getShippingAddress());
                response.put(Constants.DELIVERY_ADDRESS, quotation.getDeliveryAddress());

                // Mapping order requests inside the quotation
                List<Map<String, Object>> orderRequests = quotation.getOrderModels().stream().map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put(Constants.PRODUCT_ID, order.getProduct().getProductId());
                    orderMap.put(Constants.HSN_NO, order.getProduct().getHsnNo());
                    orderMap.put(Constants.PURCHASE_DATE, order.getPurchaseDate());
                    orderMap.put(Constants.QUANTITY, order.getQuantity());
                   // orderMap.put(Constants.COST, order.getCost());
                    return orderMap;
                }).collect(Collectors.toList());
                response.put(Constants.ORDER_REQUESTS, orderRequests);
                return response;
            }).collect(Collectors.toList());

            log.info("All quotations fetched successfully");
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(responseList), HttpStatus.OK);
        } catch (Exception e) {
            log.error("An error occurred while fetching all quotations: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.FAILED_TO_FETCH_QUOTATIONS.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Override
    @Transactional
    public ResponseEntity<?> updateQuotation(String quotationId, @Valid QuotationRequest request) throws InvoiceException {
        log.debug("Updating quotation with ID: {}", quotationId);

        QuotationModel existingQuotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.QUOTATION_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));
        try {
            existingQuotation.setVendorCode(request.getVendorCode());
            existingQuotation.setQuotationDate(request.getQuotationDate());
            existingQuotation.setDueDate(request.getDueDate());
            existingQuotation.setShippingDate(request.getShippingDate());
            existingQuotation.setDeliveryDate(request.getDeliveryDate());
            existingQuotation.setShippingAddress(request.getShippingAddress());
            existingQuotation.setDeliveryAddress(request.getDeliveryAddress());
            List<QuotationOrderModel> updatedOrderModels = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (OrderRequest orderRequest : request.getOrderRequests()) {
                try {
                    ProductModel product = productRepository.findById(orderRequest.getProductId())
                            .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.PRODUCT_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));
                    QuotationOrderModel orderModel = new QuotationOrderModel();
                    orderModel.setProduct(product);
                    orderModel.setPurchaseDate(LocalDate.parse(orderRequest.getPurchaseDate()));
                    orderModel.setQuantity(String.valueOf(orderRequest.getQuantity()));
                    orderModel.setCost(product.getUnitCost().toString());
                    orderModel.setQuotationModel(existingQuotation);
                    BigDecimal quantity = new BigDecimal(orderRequest.getQuantity());
                    BigDecimal cost = product.getUnitCost().multiply(quantity);
                    totalAmount = totalAmount.add(cost);
                    updatedOrderModels.add(orderModel);
                }  catch (InvoiceException e) {
                    log.error("Error updating order for productId {}: {}", orderRequest.getProductId(), e.getMessage());
                    throw new InvoiceException(InvoiceErrorMessageKey.QUOTATION_UPDATE_FAILED.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            existingQuotation.setTotalAmount(totalAmount);
            existingQuotation.getOrderModels().clear();
            existingQuotation.getOrderModels().addAll(updatedOrderModels);
            quotationRepository.save(existingQuotation);

            log.info("Quotation with ID: {} updated successfully", quotationId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Unexpected error during quotation update: {}", e.getMessage());
            throw new InvoiceException(InvoiceErrorMessageKey.UNEXPECTED_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteQuotation(String quotationId) throws InvoiceException {
        log.info("Deleting quotation with ID: {}", quotationId);
        try {
            QuotationModel existingQuotation = quotationRepository.findById(quotationId)
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.QUOTATION_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));
            quotationRepository.delete(existingQuotation);
            log.info("Quotation with ID: {} deleted successfully", quotationId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETE_SUCCESS), HttpStatus.OK);
        } catch (InvoiceException e) {
            log.error("Unexpected error during quotation deletion: {}", e.getMessage());
            throw new InvoiceException(InvoiceErrorMessageKey.UNEXPECTED_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> generateQuotation(Long quotationId) throws InvoiceException {
        log.info("Generating quotation with ID: {}", quotationId);
        QuotationModel quotation = quotationRepository.findById(String.valueOf(quotationId))
                .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.QUOTATION_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND));
        QuotationResponse response = new QuotationResponse();
        response.setCompanyName(quotation.getVendorCode());
        if (quotation.getCustomer() != null) {
            response.setCustomerName(quotation.getCustomer().getCustomerName());
            response.setCustomerEmail(quotation.getCustomer().getEmail());
            response.setContact(quotation.getCustomer().getMobileNumber());
            response.setGstNo(quotation.getCustomer().getGstNo());
            response.setAddress(quotation.getCustomer().getAddress());
        }
        response.setQuotationNumber(String.valueOf(quotation.getQuotationId()));
        response.setInvoiceDate(quotation.getQuotationDate() != null ? quotation.getQuotationDate().toString() : null);
        response.setDueDate(quotation.getDueDate() != null ? quotation.getDueDate().toString() : null);
        response.setShippingDate(quotation.getShippingDate() != null ? quotation.getShippingDate().toString() : null);
        response.setDeliveryDate(quotation.getDeliveryDate() != null ? quotation.getDeliveryDate().toString() : null);
        response.setShippingAddress(quotation.getShippingAddress());
        response.setDeliveryAddress(quotation.getDeliveryAddress());
        response.setTotalAmount(quotation.getTotalAmount() != null ? quotation.getTotalAmount().toString() : null);
        if (quotation.getOrderModels() != null && !quotation.getOrderModels().isEmpty()) {
            QuotationOrderModel order = quotation.getOrderModels().get(0);
            response.setHsnNo(order.getProduct() != null ? order.getProduct().getHsnNo() : null);
            response.setQuantity(order.getQuantity());
            response.setTotalCost(String.valueOf(order.getTotalCost()));
            response.setUnitCost(order.getCost());
            response.setTotalCost(order.getProduct() != null ? order.getProduct().getUnitCost().toString() : null);
            response.setGst(order.getProduct() != null ? order.getProduct().getGst() : null);
        }
        log.info("Quotation with ID: {} generated successfully", quotationId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(response), HttpStatus.OK);
    }
}
