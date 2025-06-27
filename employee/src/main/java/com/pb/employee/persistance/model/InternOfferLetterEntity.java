package com.pb.employee.persistance.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.micrometer.common.lang.Nullable;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InternOfferLetterEntity extends AbstractEntity{

    private String companyId;
    private String date;
    private String employeeName;
    private String address;
    private String department;
    private String startDate;
    private String endDate;
    private String designation;
    private String associateName;
    private String associateDesignation;
    private String acceptDate;
    private String stipend;
    private String hrName;
    private String hrEmail;
    private String internEmail;
    private String mobileNo;
    private String hrMobileNo;
    private String companyBranch;
    private boolean draft;

}
