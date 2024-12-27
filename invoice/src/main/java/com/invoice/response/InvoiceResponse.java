package com.invoice.response;

import lombok.Data;

@Data
public class InvoiceResponse {

    private String companyName;
    private String customerName;
    private String customerEmail;
    private String contactNumber;
    private String gstNo;
    private String address;
    private String invoiceDate;
    private String dueDate;
    private String invoiceNumber;
    private String productName;
    private String hsnNo;
    private String quantity;
    private String bankName;
    private String accountNo;
    private String ifscCodeBranch;
    private String panNo;
    private String unitCost;
    private String totalCost;
    private String totalAmount;
    private String gst;
    private String status;
    private String grandTotal;
}
