package com.pb.ems.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pb.ems.persistance.Entity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidateEntity implements Entity {
    private String id;
    private String companyId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String dateOfHiring;
    private String mobileNo;
    private Long otp;
    private Long expiryTime;
    private String expiryDate;
    private String status;
    private String type;
}
