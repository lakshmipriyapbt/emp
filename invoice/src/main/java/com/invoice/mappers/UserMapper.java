package com.invoice.mappers;

import com.invoice.model.UserModel;
import com.invoice.util.Constants;
import org.mapstruct.Mapper;
import java.util.HashMap;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface UserMapper {

    default Map<String, Object> toResponseMap(UserModel userModel) {
        if (userModel == null) {
            return null;
        }
        Map<String, Object> response = new HashMap<>();
        response.put(Constants.USER_ID, userModel.getUserId());
        response.put(Constants.USER_NAME,userModel.getUserName());
        response.put(Constants.PASSWORD,userModel.getPassword());
        response.put(Constants.USER_EMAIL, userModel.getUserEmail());
        response.put(Constants.ROLES, userModel.getRole());
        response.put(Constants.OTP, userModel.getOtp());
        response.put(Constants.EXPIRY_TIME, userModel.getExpiryTime());
        return response;
    }
}
