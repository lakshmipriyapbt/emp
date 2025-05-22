package com.pb.employee.validations;

import com.pb.employee.persistance.model.TDSPercentageEntity;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidateTDSValues implements ConstraintValidator<ValidateTDSValuesRange, TDSPercentageEntity> {

    @Override
    public boolean isValid(TDSPercentageEntity value, ConstraintValidatorContext context) {
        if (value == null) return true;

        try {
            long min = Long.parseLong(value.getMin());
            long max = Long.parseLong(value.getMax());
            return max > min;
        } catch (NumberFormatException e) {
            return true; // Assume pattern validation handles bad input
        }
    }


}
