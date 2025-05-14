package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.pb.ems.persistance.Entity;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserEntity implements Entity {

    private String id;
    private String userType;
    private String companyId;
    private String userId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String password;
    private String department;
    private String type;

    private Long otp;
    private Long expiryTime;
}
