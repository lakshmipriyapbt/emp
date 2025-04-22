package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserEntity implements Entity{

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
}
