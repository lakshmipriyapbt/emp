package com.pb.employee.validations;


import com.pb.employee.request.EmployeeExperience;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ValidateDates implements ConstraintValidator<ValidDateRange, EmployeeExperience> {

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        // Any initialization needed can go here
    }

    @Override
    public boolean isValid(EmployeeExperience experience, ConstraintValidatorContext context) {
        if (experience == null) {
            return true;
        }

        String startDateStr = experience.getStartDate();
        String endDateStr = experience.getEndDate();

        if (startDateStr == null || endDateStr == null) {
            return false;
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

        try {
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);
            return startDate.before(endDate);
        } catch (ParseException e) {
            return false;
        }
    }
}

