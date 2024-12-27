package com.invoice.util;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.CompanyModel;
import com.invoice.request.CompanyImageUpdate;
import com.invoice.request.CompanyRequest;
import com.invoice.request.CompanyStampUpdate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;

public class CompanyUtils {

    public static CompanyModel populateCompanyFromRequest(CompanyRequest companyRequest) {
        CompanyModel company = new CompanyModel();
        BeanUtils.copyProperties(companyRequest, company);
        company.setDeleted(false);
        return company;
    }

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    static {
        OBJECT_MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    public static void updateCompanyFromRequest(CompanyModel companyToUpdate, CompanyRequest companyRequest) throws JsonMappingException, InvoiceException {
        if (companyRequest == null) {
            throw new InvoiceException(InvoiceErrorMessageKey.COMPANY_NOT_NULL.getMessage(), HttpStatus.NOT_FOUND);
        }

        OBJECT_MAPPER.updateValue(companyToUpdate, companyRequest);
    }
    public static CompanyModel CompanyImageUpdateProperties(CompanyModel existingEntity, CompanyImageUpdate companyRequest, String id) {
        if(companyRequest.getImage() != null){
            existingEntity.setImageFile(companyRequest.getImage());
        }

        return existingEntity;
    }

    public static CompanyModel CompanyStampImageUpdateProperties(CompanyModel existingEntity, CompanyStampUpdate companyRequest, String companyId) {
        if(companyRequest.getImage() != null){
            existingEntity.setStampImage(companyRequest.getImage());
        }

        return existingEntity;
    }

    public static CompanyModel CompanyProperties(CompanyModel companyEntity, HttpServletRequest request) {
        if (companyEntity.getImageFile() != null){
            String baseUrl = getBaseUrl(request);
            String image = baseUrl + "MyImage/" + companyEntity.getImageFile();
            companyEntity.setImageFile(image);
        }

        if (companyEntity.getStampImage() != null){
            String baseUrl = getBaseUrl(request);
            String image = baseUrl + "MyImage/" + companyEntity.getStampImage();
            companyEntity.setStampImage(image);
        }
        return companyEntity;
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();

        return scheme + "://" + serverName+":" + (serverPort) + contextPath + "/";
    }
}
