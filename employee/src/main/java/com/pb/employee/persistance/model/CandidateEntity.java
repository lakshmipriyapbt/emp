package com.pb.employee.persistance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidateEntity extends AbstractEntity {
    private String id;
    private String companyId;
    private String candidateId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String password;
    private String dateOfHiring;
    private String mobileNo;
    private String expiryDate;
    private String status;
    private String type;
}
