package com.pb.employee.persistance.model;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEntity implements Entity {
    private String senderEmail;
    private String description;
}
