package com.pb.ems.util;


import org.springframework.stereotype.Component;

@Component
public class Constants {

    public static final String REMOTE_SERVICE_UNAVAILABLE = "Remote service is not available at the moment";;
    public static final String REQUEST_PAYLOAD_INVALID = "Request payload is not valid";
    public static final String REQUEST_UNAUTHORIZED = "Request is unauthorized";
    public static final String REQUEST_RESOURCE_DUPLICATE = "Resource already exists";
    public static final String REQUEST_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String REQUEST_OPERATION_INVALID = "This operation is not allowed";
    public static final String REQUEST_UNABLE_TO_PROCESS = "Remote service is not able to process the request at the moment";
    public static final String RESOURCE_ID = "ResourceId";
    public static final String INDEX_EMS = "ems";
    public static final String EMS_USERNAME = "ems.username";
    public static final String EMS_PASSWORD = "ems.password";
    public static final String EMS_ADMIN = "ems_admin";
    public static final String LOGIN_SUCCESS = "success";
}


