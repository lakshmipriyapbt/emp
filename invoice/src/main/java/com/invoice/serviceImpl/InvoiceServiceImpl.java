package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.config.Config;
import com.invoice.config.NumberToWordsConverter;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.*;
import com.invoice.opensearch.OpenSearchOperations;
import com.invoice.repository.CustomerRepository;
import com.invoice.repository.InvoiceRepository;
import com.invoice.repository.ProductRepository;
import com.invoice.request.InvoiceRequest;
import com.invoice.request.OrderRequest;
import com.invoice.response.InvoiceResponse;
import com.invoice.service.InvoiceService;
import com.invoice.util.Constants;
import com.invoice.util.CustomerUtils;
import com.invoice.util.InvoiceUtils;
import com.invoice.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static com.invoice.util.InvoiceUtils.decodeInvoiceResponse;

@Service
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceRepository repository;

    @Autowired
    private Config config;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public ResponseEntity<?> generateInvoice(String companyId, String customerId, InvoiceRequest request) throws InvoiceException, IOException {
        CompanyEntity companyEntity;
        companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            // Validate and retrieve customer with companyId
            String encodedCustomerName = CustomerUtils.encodeCustomerName(request.getCustomerName());
            CustomerModel customer = customerRepository.findByCustomerNameAndCompanyId(encodedCustomerName, companyId)
                    .orElseThrow(() -> new InvoiceException(
                            InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.BAD_REQUEST));

            // Check if the customer belongs to the provided companyId
            if (!customer.getCompanyId().equals(companyId)) {
                log.error("Customer ID {} does not belong to company ID {}", customer.getCustomerId(), companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_ASSOCIATED_WITH_COMPANY), HttpStatus.BAD_REQUEST);
            }
            // Check if the customer belongs to the provided companyId
            if (!customer.getCustomerId().equals(customerId)) {
                log.error("Customer ID {} does not belong to company ID {}", customer.getCustomerId(), companyId);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.BAD_REQUEST);
            }
            for (OrderRequest orderRequest : request.getOrderRequests()) {
                ProductModel productModel = productRepository.findByCompanyIdAndProductId(companyId, orderRequest.getProductId())
                        .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.PRODUCE_NOT_ASSOCIATED_WITH_COMPANY), HttpStatus.BAD_REQUEST
                        ));
            }
            // Step 4.1: Generate a unique resource ID for the customer using companyId and customer details
            String invoiceId = ResourceIdUtils.generateInvoiceResourceId(String.valueOf(request.getInvoiceDate()), companyId, customerId);

            // Step 2: Fetch all Invoices for the given companyId
            List<InvoiceModel> invoices = repository.findByCompanyId(companyId);

            // Step 3: Search for the customer with the provided customerId
            Optional<InvoiceModel> invoiceOptional = invoices.stream()
                    .filter(invoice -> invoice.getInvoiceId().equals(invoiceId))
                    .findFirst();
            if (invoiceOptional.isPresent()) {
                log.error("Customer already exists with ID: {}", invoiceId);
                // Return a response indicating that the customer already exists
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_ALREADY_EXISTS), HttpStatus.CONFLICT);
            }
            // Initialize invoice
            InvoiceModel invoice = InvoiceUtils.initializeInvoice(request, customer, companyId, customerId);
            invoice.setInvoiceId(invoiceId);

            // Process orders and calculate total amount
            List<OrderModel> orderModels = InvoiceUtils.processOrders(request.getOrderRequests(), invoice, productRepository);
            BigDecimal totalAmount = InvoiceUtils.calculateTotalAmount(orderModels);
            invoice.setOrderModels(orderModels);
            invoice.setTotalAmount(String.valueOf(totalAmount));

            CompanyEntity company = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (companyEntity == null) {
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND),
                        HttpStatus.NOT_FOUND);
            }
            // Calculate GST and grand total
            InvoiceUtils.calculateGstAndGrandTotal(invoice, company, customer, totalAmount, config);

            // Convert grand total to words
            invoice.setGrandTotalInWords(NumberToWordsConverter.convert(new BigDecimal(String.valueOf(invoice.getGrandTotal()))));

            // Encode the data after calculation and before saving
            InvoiceModel encodedInvoice = InvoiceUtils.encodeInvoiceData(invoice);

            repository.save(encodedInvoice);

            log.info("Invoice created successfully for customer: {}", request.getCustomerName());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.UNEXPECTED_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getInvoiceById(String companyId, String customerId, String invoiceId) throws InvoiceException, IOException {
        log.info("Fetching Invoice with ID: {}", invoiceId);
        // Fetch Company Entity
        CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        // Fetch Bank Details
        String companyIndex = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        List<BankEntity> bankEntities;
        try {
            bankEntities = openSearchOperations.getBankDetailsOfCompany(companyIndex);
            if (bankEntities == null || bankEntities.isEmpty()) {
                log.error("No bank details found for company index: {}", companyIndex);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Error while fetching bank details for company ID {}: {}", companyId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_GET_BANK_DETAILS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Fetch Customer Model
        CustomerModel customerModel = customerRepository.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer with ID {} not found", customerId);
                    return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                });
        // Fetch Invoice Model
        InvoiceModel invoiceModel = repository.findById(invoiceId)
                .orElseThrow(() -> {
                    log.error("Invoice with ID {} not found", invoiceId);
                    return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
                });
        try {
            InvoiceResponse invoiceDetails = InvoiceUtils.fromEntities(companyEntity, customerModel, invoiceModel, bankEntities);

            InvoiceResponse invoiceResponse = decodeInvoiceResponse(invoiceDetails);

            return ResponseEntity.ok(invoiceResponse);
        } catch (Exception ex) {
            log.error("Error while building invoice response for ID {}: {}", invoiceId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.RESPONSE_BUILD_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCustomerAllInvoices(String companyId, String customerId) throws InvoiceException, IOException {
        log.info("Fetching Invoice with Customer ID: {}", customerId);
        // Fetch Company Entity
        CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        // Fetch Bank Details
        String companyIndex = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        List<BankEntity> bankEntities;
        try {
            bankEntities = openSearchOperations.getBankDetailsOfCompany(companyIndex);
            if (bankEntities == null || bankEntities.isEmpty()) {
                log.error("No bank details found for company index: {}", companyIndex);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Error while fetching bank details for company ID {}: {}", companyId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_GET_BANK_DETAILS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Fetch Customer Model
        CustomerModel customerModel = customerRepository.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer with ID {} not found", customerId);
                    return new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND), HttpStatus.NOT_FOUND);
                });
        // Fetch All Invoices for Customer
        List<InvoiceModel> invoiceModels = repository.findAllByCustomerId(customerId);
        if (invoiceModels.isEmpty()) {
            log.error("No invoices found for Customer ID: {}", customerId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            // Map all invoices to initial responses
            List<InvoiceResponse> initialResponses = invoiceModels.stream()
                    .map(invoiceModel -> InvoiceUtils.fromEntities(companyEntity, customerModel, invoiceModel, bankEntities))
                    .toList();
            // Decode each response
            List<InvoiceResponse> decodedResponses = initialResponses.stream()
                    .map(InvoiceUtils::decodeInvoiceResponse)
                    .toList();
            return ResponseEntity.ok(decodedResponses);
        } catch (Exception ex) {
            log.error("Error while building invoice response for ID {}: {}", customerId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.RESPONSE_BUILD_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCompanyAllInvoices(String companyId) throws InvoiceException, IOException {
        log.info("Fetching all invoices for Company ID: {}", companyId);
        // Fetch Company Entity
        CompanyEntity companyEntity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company with ID {} not found", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        // Fetch Bank Details
        String companyIndex = ResourceIdUtils.generateCompanyIndex(companyEntity.getShortName());
        List<BankEntity> bankEntities;
        try {
            bankEntities = openSearchOperations.getBankDetailsOfCompany(companyIndex);
            if (bankEntities == null || bankEntities.isEmpty()) {
                log.error("No bank details found for company index: {}", companyIndex);
                throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.BANK_DETAILS_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Error while fetching bank details for company ID {}: {}", companyId, ex.getMessage());
            throw new InvoiceException(
                    InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_GET_BANK_DETAILS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Fetch All Invoices for the Company
        List<InvoiceModel> invoiceModels = repository.findAllByCompanyId(companyId);
        if (invoiceModels.isEmpty()) {
            log.error("No invoices found for Company ID: {}", companyId);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVOICE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            // Map all invoices to responses with customer details
            List<InvoiceResponse> initialResponses = invoiceModels.stream()
                    .map(invoiceModel -> {
                        // Fetch associated CustomerModel for the invoice
                        CustomerModel customerModel = customerRepository.findById(invoiceModel.getCustomerId())
                                .orElse(null); // Handle null gracefully in mapping

                        return InvoiceUtils.fromEntities(companyEntity, customerModel, invoiceModel, bankEntities);
                    })
                    .toList();
            // Decode each response
            List<InvoiceResponse> decodedResponses = initialResponses.stream()
                    .map(InvoiceUtils::decodeInvoiceResponse)
                    .toList();
            return ResponseEntity.ok(decodedResponses);
        } catch (Exception ex) {
            log.error("Error while building invoice response for Company ID {}: {}", companyId, ex.getMessage());
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.RESPONSE_BUILD_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}