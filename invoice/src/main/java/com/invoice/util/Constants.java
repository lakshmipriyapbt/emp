package com.invoice.util;
import org.springframework.stereotype.Component;

@Component
public class Constants {

    public static final String[] UNITS = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    public static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };
    // Error Messages
    public static final String REMOTE_SERVICE_UNAVAILABLE = "Remote service is not available at the moment";
    public static final String REQUEST_PAYLOAD_INVALID = "Request payload is not valid";
    public static final String REQUEST_UNAUTHORIZED = "Request is unauthorized";
    public static final String REQUEST_RESOURCE_DUPLICATE = "Resource already exists";
    public static final String REQUEST_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String REQUEST_OPERATION_INVALID = "This operation is not allowed";
    public static final String REQUEST_UNABLE_TO_PROCESS = "Remote service is not able to process the request at the moment";
    public static final String AUTH_KEY = "Authorization";
    public static final Object CREATE_SUCCESS = "Created successfully!";
    public static final Object DELETE_SUCCESS = "Deleted successfully";
    public static final Object UPDATE_SUCCESS = "Updated successfully!";
    public static final String COMPANY_ID = "companyId";
    public static final String USER_NAME = "userName";
    public static final String EMAIL = "email";
    public static final String PHONE = "phone";
    public static final String OTP = "otp";
    public static final String EXPIRY_TIME = "expiryTime";
    public static final String CUSTOMER_NAME = "customerName";
    public static final String PURCHASE_ORDER = "purchaseOrder";
    public static final String VENDOR_CODE = "vendorCode";
    public static final String INVOICE_DATE = "invoiceDate";
    public static final String ORDER_REQUESTS = "orderRequests";
    public static final String PRODUCT_ID = "productId";
    public static final String HSN_NO = "hsnNo";
    public static final String PURCHASE_DATE = "purchaseDate";
    public static final String QUANTITY = "quantity";
    public static final String UNIT_COST = "unitCost";
    public static final String STATUS_VALUE = "status";
    public static final String STATUS = "status";
    public static final String USER_ID = "userId";
    public static final String EMAIL_ID = "userEmail";
    public static final String ROLES = "role";
    public static final String INVOICE_ID = "invoiceId";
    public static final String CUSTOMER_ID = "customerId";
    public static final String QUOTATION_ID = "quotationId";
    public static final String QUOTATION_DATE = "quotationDate";
    public static final String DUE_DATE = "dueDate";
    public static final String SHIPPING_DATE = "shippingDate" ;
    public static final String DELIVERY_DATE = "deliveryDate";
    public static final String SHIPPING_ADDRESS = "shippingAddress" ;
    public static final String DELIVERY_ADDRESS = "DeliveryAddress";
    public static final String COMPANY_CREATED_SUCCESS = "Company.Created.Success";
    public static final String NO_USERS_FOUND = "No.users.found";
    public static final String COMPANY_NAME = "companyName";
    public static final String COMPANY_EMAIL = "companyEmail";
    public static final String CUSTOMER_EMAIL = "email";
    public static final String CUSTOMER_ADDRESS = "address";
    public static final String CUSTOMER_STATE = "state";
    public static final String USER_DELETED_SUCCESS = "User Deleted Success";
    public static final String PASSWORD = "password";
    public static final String CITY = "city";
    public static final String GST_NO = "gstNo";
    public static final String PINCODE= "pinCode";
    public static final String CUSTOMER_STATE_CODE = "stateCode";
    public static final String PRODUCT_NAME = "productName";
    public static final String PAN = "pan";
    public static final String GENDER = "gender";
    public static final String STAMP_SIGN = "stampImage";
    public static final String STATE = "state";
    public static final String BANK_ACCOUNT = "accountNumber";
    public static final String BANK_NAME = "bankName";
    public static final String BRANCH = "branch";
    public static final String IFSC_CODE = "ifscCode";
    public static final String INVOICE_MODEL = "invoiceModel";
    public static final String USER_EMAIL = "userEmail";
    public static final String TOTAL_COST = "totalCost";
    public static final String GST = "gst";
    public static final String GST_NUMBER = "gstNumber";
    public static final String GRAND_TOTAL = "grandTotal";
    public static final String ADDRESS = "Address";
    public static final String TOTAL_AMOUNT = "totalAmount";
    public static final String COST = "cost";
    public static final String C_GST = "cGst";
    public static final String S_GST = "sGst";
    public static final String I_GST = "iGst";
    public static final String ZERO = "0";
    public static final String INVOICE = "invoice";
    public static final String MOBILE_NUMBER = "mobileNumber";
    public static final Object SUCCESS = "success";
    public static final String FILE = "file";
    public static final String COMPANY_IMAGE_FILE = "imageFile";
    public static final String CUSTOMER_COMPANY = "customerCompany";
    public static final String GRAND_TOTAL_WORDS = "grandTotalInWords";
    public static final String ACCOUNT_TYPE = "accountType";
    public static final String PLACE = "place";
    public static final String IMAGE_PATH ="/MyImage/**";
    public static final String IMAGE_PATH_FILE ="file:/G:/MyImage/";
    public static final String ZEROS = "Zero";
    public static final String AND = " and ";
    public static final String PAISE = " Paise";
    public static final String ONLY = " Only";
    public static final String HUNDRED = " Hundred";
    public static final String THOUSAND = " Thousand";
    public static final String LAKH = " Lakh";
    public static final String CRORE = " Crore";
    public static final String SERVICE = "service";
    public static final String BEARER = "Bearer";
    public static final String JWT = "JWT";
    public static final String MULTI_PART_FILE = "MultipartFile";
    public static final String STRING = "String";
    public static final String BINARY = "binary";
    public static final String AUTHORIZATION = "Authorization";
}