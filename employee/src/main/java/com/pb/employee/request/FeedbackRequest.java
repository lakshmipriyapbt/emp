package com.pb.employee.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {


    @Schema(example = "senderEmail")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._%+-]*[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\\.[a-z]{2,6}$", message = "{invalid.senderEmail}")
    @NotBlank(message = "{senderEmail.notnull.message}")
    private String senderEmail;// "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"


    @Schema(example = "description")
    @Size(min = 2, max = 300, message = "{description.size.message}")
    @NotBlank(message = "{description.notnull.message}")
    private String description;
}
