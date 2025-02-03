package com.invoice.response;

import lombok.*;
import java.util.List;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private String companyName;
    private String companyAddress;
    private String companyBranch;
    private String cinNo;
    private String customerName;
    private String customerEmail;
    private String contactNumber;
    private String gstNo;
    private String customerGstNo;
    private String customerAddress;
    private String customerState;
    private String customerCity;
    private String customerPinCode;
    private String invoiceDate;
    private String dueDate;
    private String invoiceNumber;
    private String purchaseOrder;
    private String vendorCode;
    private String status;
    private String totalAmount;
    private String grandTotal;
    private String grandTotalInWords;
    private String gst;
    private String cGst;
    private String sGst;
    private String iGst;

    private List<BankDetailResponse> bankDetails;
    private List<OrderDetailResponse> orderDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankDetailResponse {
        private String bankName;
        private String accountNumber;
        private String accountType;
        private String branch;
        private String ifscCode;
        private String bankAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailResponse {
        private String productName;
        private String hsnNo;
        private String quantity;
        private String unitCost;
        private String totalCost;
        private String service;
    }
}
