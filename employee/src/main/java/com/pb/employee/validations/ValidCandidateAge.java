package com.pb.employee.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = CandidateAgeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCandidateAge {
    String message() default "candidate must be 20 to 65 age between.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
