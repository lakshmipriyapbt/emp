package com.invoice.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = GstValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateGst {
    String message() default "Invalid GST combination";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
