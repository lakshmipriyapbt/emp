package com.invoice.validations;

import com.invoice.request.InvoiceUpdateRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;


public class GstValidator implements ConstraintValidator<ValidateGst, InvoiceUpdateRequest> {

    @Override
    public boolean isValid(InvoiceUpdateRequest request, ConstraintValidatorContext context) {
        String cGst = request.getCGst();
        String sGst = request.getSGst();
        String iGst = request.getIGst();

        boolean isIGstProvided = iGst != null && !iGst.trim().isEmpty();
        boolean isCGstProvided = cGst != null && !cGst.trim().isEmpty();
        boolean isSGstProvided = sGst != null && !sGst.trim().isEmpty();

        context.disableDefaultConstraintViolation();

        if (isIGstProvided && (isCGstProvided || isSGstProvided)) {
            if (isCGstProvided) {
                context.buildConstraintViolationWithTemplate("CGST must not be provided when IGST is present.")
                        .addPropertyNode("cGst")
                        .addConstraintViolation();
            }
            if (isSGstProvided) {
                context.buildConstraintViolationWithTemplate("SGST must not be provided when IGST is present.")
                        .addPropertyNode("sGst")
                        .addConstraintViolation();
            }
            return false;
        }

        if (isSGstProvided && !isCGstProvided) {
            context.buildConstraintViolationWithTemplate("CGST is required when SGST is provided.")
                    .addPropertyNode("cGst")
                    .addConstraintViolation();
            return false;
        }

        if (isCGstProvided && !isSGstProvided) {
            context.buildConstraintViolationWithTemplate("SGST is required when CGST is provided.")
                    .addPropertyNode("sGst")
                    .addConstraintViolation();
            return false;
        }


        return true;
    }

}