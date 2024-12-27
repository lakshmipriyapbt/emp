package com.invoice.mappers;

import com.invoice.model.CompanyModel;
import com.invoice.request.CompanyRequest;
import com.invoice.util.Constants;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.HashMap;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    default Map<String, Object> toResponseMap(CompanyModel companyModel) {
        if (companyModel == null) {
            return null;
        }

        Map<String, Object> response = new HashMap<>();
        response.put(Constants.COMPANY_ID, companyModel.getCompanyId());
        response.put(Constants.PASSWORD,companyModel.getPassword());
        response.put(Constants.USER_NAME, companyModel.getUserName());
        response.put(Constants.COMPANY_EMAIL, companyModel.getCompanyEmail());
        response.put(Constants.PHONE, companyModel.getPhone());
        response.put(Constants.COMPANY_NAME, companyModel.getCompanyName());
        response.put(Constants.PAN, companyModel.getPan());
        response.put(Constants.GST_NO, companyModel.getGstNumber());
        response.put(Constants.GENDER, companyModel.getGender());
        response.put(Constants.STAMP_SIGN, companyModel.getStampImage());
        response.put(Constants.BANK_ACCOUNT, companyModel.getAccountNumber());
        response.put(Constants.BANK_NAME, companyModel.getBankName());
        response.put(Constants.BRANCH, companyModel.getBranch());
        response.put(Constants.IFSC_CODE ,companyModel.getIfscCode());
        response.put(Constants.CUSTOMER_ADDRESS, companyModel.getAddress());
        response.put(Constants.STATE, companyModel.getState());

        response.put(Constants.INVOICE, null);

        return response;
    }
}
