package com.invoice.exception;

public enum InvoiceErrorMessageKey {

    PRODUCT_NOT_FOUND("product.not.found"),
    CUSTOMER_NOT_FOUND("customer.not.found"),
    COMPANY_NOT_FOUND("company.not.found"),
    INVOICE_SAVE_FAILED("invoice.save.fail"),
    UNEXPECTED_ERROR("unexpected.error"),
    INVOICE_CREATION_FAILED("invoice.creation.failed"),
    ORDER_CREATION_FAILED("order.creation.failed"),
    ORDER_PROCESSING_FAILED("order.processing.failed"),
    COMPANY_RETRIEVAL_FAILED("company.retrieval.failed"),
    CREATE_FAILED("create.failed"),
    INTERNAL_SERVER_ERROR("internal.server.error"),
    INVALID_INVOICE_ID_FORMAT("invalid.invoiceId.format"),
    INVOICE_NOT_FOUND("invoice.not.found"),
    INVOICE_UPDATE_FAILED("invoice.update.failed"),
    ERROR_CREATING_COMPANY("error.creating.company"),
    ERROR_CREATING_PRODUCT("error.creating.product"),
    USER_NOT_FOUND("user.not.found"),
    QUOTATION_CREATION_FAILED("quotation.creation.failed"),
    QUOTATION_SAVE_FAILED("quotation.save.failed"),
    QUOTATION_NOT_FOUND("quotation.not.found"),
    FAILED_TO_FETCH_QUOTATIONS("failed.to.fetch.quotations"),
    QUOTATION_UPDATE_FAILED("quotation.update.failed"),
    ERROR_DELETING_COMPANY("error.deleting.company"),
    EMAIL_ALREADY_EXISTS("email.already.exists"),
    MOBILE_ALREADY_EXISTS("mobile.already.exists"),
    GSTNO_ALREADY_EXISTS("GSTno.already.exists"),
    ERROR_CREATING_USER("Error.creating.user"),
    COMPANY_NAME_OR_EMAIL_EXISTS("company.name.or.email.exists"),
    ERROR_UPDATING_USER("error.updating.user"),
    ERROR_RETRIEVING_USERS("error.retrieving.users"),
    INVOICE_DELETION_FAILED("Invoice.deletion.failed"),
    ERROR_FETCHING_COMPANY("error.fetching.company"),
    ERROR_CREATING_CUSTOMER("error.creating.customer"),
    ERROR_UPDATING_COMPANY("error.updating.company"),
    INVALID_COMPANY("invalid.company"),
    UNABLE_SAVE_COMPANY("Unable to save company"),
    COMPANY_NOT_NULL("Company request can't be null"),
    PRODUCT_NOT_NULL("Product request can't be null"),
    CUSTOMER_NOT_NULL("Customer request can't be null");

    private final String message;

    InvoiceErrorMessageKey(String message) {
        this.message = message;
    }
    public String getMessage() {
        return message;
    }
    @Override
    public String toString() {
        return message;
    }
}
