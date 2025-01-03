package com.invoice.model;

import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum ResourceType {
    CUSTOMER("customer"),
    PRODUCT("PRODUCT");

    private final String value;
    public String value() {return this.value;}

    public static ResourceType fromValue(String value) throws InvoiceException {
        if(StringUtils.isBlank(value))
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_RESOURCE_TYPE), HttpStatus.BAD_REQUEST);

        for (ResourceType type : values()) {
            if (type.name().equalsIgnoreCase(value) || type.value().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new InvoiceException(String.format(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.INVALID_RESOURCE_TYPE), value), HttpStatus.BAD_REQUEST);
    }
}
