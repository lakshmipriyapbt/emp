package com.pb.employee.validations;

import com.pb.employee.request.CandidatePayload.CandidateRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;


public class CandidateAgeValidator implements ConstraintValidator<ValidCandidateAge, CandidateRequest> {

    @Override
    public boolean isValid(CandidateRequest candidateRequest, ConstraintValidatorContext context) {
        if (candidateRequest.getDateOfBirth() == null || candidateRequest.getDateOfHiring() == null) {
            return true; // Skip validation if dates are not present
        }

        LocalDate dateOfBirth = LocalDate.parse(candidateRequest.getDateOfBirth());
        LocalDate dateOfHiring = LocalDate.parse(candidateRequest.getDateOfHiring());

        int ageAtHiring = Period.between(dateOfBirth, dateOfHiring).getYears();

        return ageAtHiring >= 15 && ageAtHiring <= 80;
    }

}

