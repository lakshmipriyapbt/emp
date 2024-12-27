package com.invoice.mappers;

import com.invoice.model.CustomerModel;
import com.invoice.request.CustomerRequest;
import com.invoice.util.Constants;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.HashMap;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    default Map<String, Object> toResponseMap(CustomerModel customerModel) {
        if (customerModel == null) {
            return null;
        }

        Map<String, Object> response = new HashMap<>();
        response.put(Constants.CUSTOMER_ID, customerModel.getCustomerId());
        response.put(Constants.CUSTOMER_NAME, customerModel.getCustomerName());
        response.put(Constants.CUSTOMER_COMPANY,customerModel.getCustomerCompany());
        response.put(Constants.EMAIL, customerModel.getEmail());
        response.put(Constants.PHONE, customerModel.getMobileNumber());
        response.put(Constants.CUSTOMER_ADDRESS, customerModel.getAddress());
        response.put(Constants.STATE, customerModel.getState());
        response.put(Constants.CITY, customerModel.getCity());
        response.put(Constants.PINCODE, customerModel.getPinCode());
        response.put(Constants.GST_NO, customerModel.getGstNo());
        response.put(Constants.CUSTOMER_STATE_CODE, customerModel.getStateCode());
        response.put(Constants.INVOICE_MODEL, null);

        return response;
    }
}
