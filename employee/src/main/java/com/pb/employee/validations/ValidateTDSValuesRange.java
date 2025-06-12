package com.pb.employee.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = ValidateTDSValues.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateTDSValuesRange {

    String message() default "Max value must be grater then Min value."; // Default message

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
