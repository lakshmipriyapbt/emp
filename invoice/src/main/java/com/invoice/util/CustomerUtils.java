package com.invoice.util;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.CustomerModel;
import com.invoice.request.CustomerRequest;
import com.invoice.request.CustomerUpdateRequest;
import org.springframework.http.HttpStatus;

import java.util.Base64;

public class CustomerUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();


    public static CustomerModel maskCustomerProperties(CustomerRequest customerRequest,String companyId,String customerId) {
        // Declare masked variables
        String customerName = null, email = null, mobileNo = null,
                address = null,state =null,city =null,
                gst=null,pinCode=null,stateCode=null;
        // Masking bank details
        if (customerRequest.getCustomerName() != null) {
            customerName = Base64.getEncoder().encodeToString(customerRequest.getCustomerName().getBytes());
        }
        if (customerRequest.getEmail() != null) {
            email = Base64.getEncoder().encodeToString(customerRequest.getEmail().getBytes());
        }
        if (customerRequest.getAddress() != null) {
            address = Base64.getEncoder().encodeToString(customerRequest.getAddress().getBytes());
        }
        if (customerRequest.getMobileNumber() != null) {
            // Masking the branch name as an example
            mobileNo = Base64.getEncoder().encodeToString(customerRequest.getMobileNumber().getBytes());
        }
        if (customerRequest.getState() != null) {
            // Masking the branch name as an example
            state = Base64.getEncoder().encodeToString(customerRequest.getState().getBytes());
        }

        if (customerRequest.getCity() != null) {
            // Masking the state information
            city = Base64.getEncoder().encodeToString(customerRequest.getCity().getBytes());
        }

        if (customerRequest.getCustomerGstNo() != null) {
            // Masking the state information
            gst = Base64.getEncoder().encodeToString(customerRequest.getCustomerGstNo().getBytes());
        }
        if (customerRequest.getPinCode() != null) {
            // Masking the state information
            pinCode = Base64.getEncoder().encodeToString(customerRequest.getPinCode().getBytes());
        }

        if (customerRequest.getStateCode() != null) {
            // Masking the state information
            stateCode = Base64.getEncoder().encodeToString(customerRequest.getStateCode().getBytes());
        }
        CustomerModel customerModel = objectMapper.convertValue(customerRequest, CustomerModel.class);
        customerModel.setCompanyId(companyId);
        customerModel.setCustomerId(customerId);// Associate with the company
        customerModel.setCustomerName(customerName);
        customerModel.setCity(city);
        customerModel.setEmail(email);
        customerModel.setCustomerGstNo(gst);
        customerModel.setState(state);
        customerModel.setAddress(address);
        customerModel.setStateCode(stateCode);
        customerModel.setPinCode(pinCode);
        customerModel.setMobileNumber(mobileNo);
        // Add any other fields that need masking and setting...
        return customerModel;
    }

    public static CustomerModel unmaskCustomerProperties(CustomerModel customerModel) {
        // Declare unmasked variables
        String customerName = null, email = null, mobileNo = null,
                address = null, state = null, city = null,
                gst = null, pinCode = null, stateCode = null;

        // Unmasking the properties by decoding the Base64 encoded values
        if (customerModel.getCustomerName() != null) {
            customerName = new String(Base64.getDecoder().decode(customerModel.getCustomerName()));
        }
        if (customerModel.getEmail() != null) {
            email = new String(Base64.getDecoder().decode(customerModel.getEmail()));
        }
        if (customerModel.getAddress() != null) {
            address = new String(Base64.getDecoder().decode(customerModel.getAddress()));
        }
        if (customerModel.getMobileNumber() != null) {
            mobileNo = new String(Base64.getDecoder().decode(customerModel.getMobileNumber()));
        }
        if (customerModel.getState() != null) {
            state = new String(Base64.getDecoder().decode(customerModel.getState()));
        }
        if (customerModel.getCity() != null) {
            city = new String(Base64.getDecoder().decode(customerModel.getCity()));
        }
        if (customerModel.getCustomerGstNo() != null) {
            gst = new String(Base64.getDecoder().decode(customerModel.getCustomerGstNo()));
        }
        if (customerModel.getPinCode() != null) {
            pinCode = new String(Base64.getDecoder().decode(customerModel.getPinCode()));
        }
        if (customerModel.getStateCode() != null) {
            stateCode = new String(Base64.getDecoder().decode(customerModel.getStateCode()));
        }
        // Create a CustomerRequest object and set the unmasked properties
        customerModel.setCustomerName(customerName);
        customerModel.setEmail(email);
        customerModel.setAddress(address);
        customerModel.setMobileNumber(mobileNo);
        customerModel.setState(state);
        customerModel.setCity(city);
        customerModel.setCustomerGstNo(gst);
        customerModel.setPinCode(pinCode);
        customerModel.setStateCode(stateCode);

        // Return the unmasked CustomerRequest
        return customerModel;
    }

    public static CustomerModel maskCustomerUpdateProperties(CustomerUpdateRequest customerRequest, CustomerModel customerModel) {
        // Declare unmasked variables
        String address = null, state = null, city = null,
                gst = null, pinCode = null, stateCode = null;

        if (customerRequest.getAddress() != null) {
            address = Base64.getEncoder().encodeToString(customerRequest.getAddress().getBytes());
        }
        if (customerRequest.getState() != null) {
            // Masking the branch name as an example
            state = Base64.getEncoder().encodeToString(customerRequest.getState().getBytes());
        }

        if (customerRequest.getCity() != null) {
            // Masking the state information
            city = Base64.getEncoder().encodeToString(customerRequest.getCity().getBytes());
        }

        if (customerRequest.getGstNo() != null) {
            // Masking the state information
            gst = Base64.getEncoder().encodeToString(customerRequest.getGstNo().getBytes());
        }
        if (customerRequest.getPinCode() != null) {
            // Masking the state information
            pinCode = Base64.getEncoder().encodeToString(customerRequest.getPinCode().getBytes());
        }

        if (customerRequest.getStateCode() != null) {
            // Masking the state information
            stateCode = Base64.getEncoder().encodeToString(customerRequest.getStateCode().getBytes());
        }

        customerModel.setCity(city);
        customerModel.setCustomerGstNo(gst);
        customerModel.setState(state);
        customerModel.setAddress(address);
        customerModel.setStateCode(stateCode);
        customerModel.setPinCode(pinCode);
        // Add any other fields that need masking and setting...
        return customerModel;
    }
    public static void updateCustomerFromRequest(CustomerModel customerToUpdate, CustomerUpdateRequest customerRequest) throws JsonMappingException, InvoiceException {
        if (customerRequest == null) {
            throw new InvoiceException(InvoiceErrorMessageKey.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        objectMapper.updateValue(customerToUpdate, customerRequest);
    }

    public static String encodeCustomerName(String encodedName) {
        if (encodedName != null) {
            return new String(Base64.getEncoder().encode(encodedName.getBytes()));
        }
        return null;
    }

}