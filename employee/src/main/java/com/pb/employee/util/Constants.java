package com.pb.employee.util;



import org.springframework.stereotype.Component;


@Component
public class Constants {

    public static final String REMOTE_SERVICE_UNAVAILABLE = "Remote service is not available at the moment";
    public static final String REQUEST_PAYLOAD_INVALID = "Request payload is not valid";
    public static final String REQUEST_UNAUTHORIZED = "Request is unauthorized";
    public static final String REQUEST_RESOURCE_DUPLICATE = "Resource already exists";
    public static final String REQUEST_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String REQUEST_OPERATION_INVALID = "This operation is not allowed";
    public static final String REQUEST_UNABLE_TO_PROCESS = "Remote service is not able to process the request at the moment";
    public static final String RESOURCE_ID = "ResourceId";
    public static final String INDEX_EMS = "ems";
    public static final String EMS_USERNAME = "ems.username";
    public static final String EMS_PASSWORD = "ems.password";
    public static final String EMS_ADMIN = "ems_admin";
    public static final String LOGIN_SUCCESS = "success";
    public static final String COMPANY = "company";
    public static final String COMPANY_ID = "companyId";
    public static final String ATTENDANCE = "attendance";
    public static final String SALARY = "salary";
    public static final String DEFAULT = "default";
    public static final String TYPE = "type";
    public static final String COMPANY_NAME = "companyName";
    public static final String SHORT_NAME = "shortName";
    public static final String AUTH_KEY = "Authorization";


    public static final String EMPLOYEE_TYPE = "CompanyAdmin";
    public static final String EMPLOYEE_NAME = "EmployeeName";
    public static final String EMPLOYEE = "employee";
    public static final String SUCCESS = "success";

    public static final String EMPLOYEE_ID = "employeeId";
    public static final String EMAIL_ID = "emailId";
    public static final Object DELETED = "deleted";
    public static final String DEPARTMENT = "department";
    public static final String DESIGNATION = "designation";
    public static final String NAME = "name";
    public static final String PAYSLIP = "payslip";
    public static final String PAYSLIP_ENTITY = "payslipEntity";
    public static final String FILE = "file";
    public static final String MONTH = "month";
    public static final String YEAR = "year";
    public static final String GENERATE_PAYSLIP = "generatePayslip";
    public static final String EMPLOYEE_WITHOUT_ATTENDANCE = "employeesWithoutAttendance";
    public static final String DUPLICATE_EMPLOYEE_ID = "EmployeeId";
    public static final String DUPLICATE_AADHAAR_ID = "AadhaarId";
    public static final String DUPLICATE_PAN_NO = "PanNo";
    public static final String DUPLICATE_UAN_NO = "UanNo";
    public static final String DUPLICATE_ACCOUNT_NO = "AccountNo";
    public static final String DUPLICATE_CIN_NO = "CinNo";
    public static final String DUPLICATE_REGISTER_NO = "RegisterNo";
    public static final String DUPLICATE_MOBILE_NO = "MobileNo";
    public static final String DUPLICATE_ALTERNATE_NO = "AlternateNo";
    public static final String DUPLICATE_GST_NO = "GstNo";
    public static final String DUPLICATE_PERSONAL_MAIL = "PersonalMailId";
    public static final String DUPLICATE_PERSONAL_MOBILE = "PersonalMobileNo";
    public static final String KEYWORD = ".keyword";
    public static final String EMS_ADMIN_LOGIN = "/emsadmin/login";
    public static final String TOKEN_VALIDATE = "/token/validate";
    public static final String COMPANY_LOGIN = "/company/login";
    public static final String VALIDATE = "/validate";
    public static final String FORGOT_PASSWORD = "/forgot/password";
    public static final String UPDATE_PASSWORD = "/update/password";
    public static final String PAYSLIP_TEMPLATE_ONE = "payslip1.ftl";
    public static final String PAYSLIP_TEMPLATE_TWO = "payslip2.ftl";
    public static final String PAYSLIP_TEMPLATE_THREE = "payslip3.ftl";
    public static final String PAYSLIP_TEMPLATE_FOUR = "payslip4.ftl";
    public static final String HRA = "HRA";
    public static final String HRA_SMALL = "hra";
    public static final String PF = "PF";
    public static final String PF_SMALL = "pf";
    public static final String TOTAL_DEDUCTION = "Total Deductions (B)";
    public static final String TOTAL_DEDUCTION_SMALL = "totalDeductions";
    public static final String TOTAL_TAX = "Total Tax (C)";
    public static final String TOTAL_TAX_SMALL = "totalTax";
    public static final String PF_TAX = "PF Tax";
    public static final String INCOME_TAX = "Income Tax";
    public static final String PF_CONTRIBUTION_EMPLOYEE = "PF Contribution Employee";
    public static final String SALARY_STRUCTURE = "salary_structure";
    public static final String NEW = "new";
    public static final String OLD = "old";
    public static final String DUPLICATE_EMAIL_ID = "emailId";
    public static final String DUPLICATE_AS_MOBILE_NO = "The mobile and alternate numbers cannot be the same.";
    public static final String DUPLICATE_AS_EMAIL_NO = "The emailId and PersonalEmailId cannot be the same.";
    public static final String ALLOWANCE_LIST = "allowanceList";
    public static final String DEDUCTION_LIST = "deductionList";
    public static final String PRIVATE = "Private Limited";
    public static final String FIRM = "Firm";

    public static final String BASIC_SALARY = "Basic Salary";
    public static final String ALLOWANCE = "Allowance";
    public static final String OTHER_ALLOWANCES = "Other Allowances";
    public static final String EXPERIENCE_LETTER = "expLetter.ftl";
    public static final String REQUEST = "request";
    public static final String EXPERIENCE_LETTER_TWO = "expLetter2.ftl";
    public static final String OFFER_LETTER_TEMPLATE1 = "offerTemplate1.ftl";
    public static final String APPRAISAL_LETTER_TEMPLATE1 = "appraisalLetter1.ftl";
    public static final String OFFER_LETTER_REQUEST = "offerLetter";
    public static final String ATTACHMENT = "attachment";
    public static final String OFFER_LETTER = "offer_letter.pdf";
    public static final String ACTIVE = "Active";
    public static final String RELIEVING = "relieving";
    public static final String STAMP = "stamp";
    public static final String EXPERIENCE_LETTER_PDF = "experience_letter.pdf";
    public static final String ANNUAL = "annually";
    public static final String TOTAL_DEDUCTIONS = "Total Deductions";
    public static final String NET_SALARY = "Net Salary";
    public static final String GROSS_CTC = "Gross (CTC)";
    public static final String BLURRED_IMAGE = "blurredImage";
    public static final String DATA = "data:image/png;base64,";

    public static final String APPRAISAL_LETTER_REQUEST = "appraisal";
    public static final String DYNAMIC_EXPERIENCE_LETTER_PDF = "dynamicExpLetter.ftl";
    public static final String APPRAISAL_LETTER = "appraisal_letter.pdf";
    public static final String RELIEVING_LETTER1 = "relievingLetter.ftl";
    public static final String RELIEVING_LETTER_PDF = "relievingLetter";
    public static final String RELIEVING_LETTER2 = "relievingLetter2.ftl";
    public static final String INTERNSHIP_CERT = "internship_certificate.pdf";
    public static final String TEMPLATE = "template";
    public static final String INTERNSHIP = "internship";
    public static final String INTERNSHIP_TEMPLATE1 = "internship1.ftl";
    public static final String INTERNSHIP_TEMPLATE2 = "internship2.ftl";
    public static final String APPRAISAL_LETTER_TEMPLATE2 = "appraisalLetter2.ftl";

    public static final String NOTICE_PERIOD = "NoticePeriod";
    public static final String INACTIVE = "InActive";
    public static final String STATUS = "status";
    public static final String PF_EMPLOYEE = "pfEmployee";
    public static final String PF_EMPLOYER = "pfEmployer";
}