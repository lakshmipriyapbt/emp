package com.pb.employee.validations;

import com.pb.employee.request.TDSPayload.TDSCreatePayload;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.text.SimpleDateFormat;
import java.util.Date;

public class ValidateYears implements ConstraintValidator<ValidateYearsRange, TDSCreatePayload> {


    @Override
    public void initialize(ValidateYearsRange constraintAnnotation) {
        // Any initialization needed can go here
    }

    @Override
    public boolean isValid(TDSCreatePayload entity, ConstraintValidatorContext context) {
        if (entity == null) {
            return true;
        }

        String startYear = entity.getStartYear();
        String endYear = entity.getEndYear();

        if (startYear == null || endYear == null) {
            return false;
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy");

        try {
            // Parse the start and end year using the "yyyy" format
            Date startDate = dateFormat.parse(startYear);
            Date endDate = dateFormat.parse(endYear);

            // Extract the year part from the Date objects
            int startYearInt = startDate.getYear() + 1900; // getYear() returns the year offset from 1900
            int endYearInt = endDate.getYear() + 1900;

            // Check if endYear is exactly one year after startYear
            return endYearInt == startYearInt + 1;
        } catch (Exception e) {
            // If parsing fails, return false
            return false;
        }
    }
}
