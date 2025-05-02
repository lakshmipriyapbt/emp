package com.pb.employee.config;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = ValidateYears.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateYearsRange {

    String message() default "End year must be after the start year."; // Default message

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
