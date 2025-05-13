package com.pb.employee.persistance.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidaysEntity {

    @Schema(example = "Birthday2025")
    @Pattern(regexp = "^(?!\\s)(.*?)(?<!\\s)$", message = "{invalid.event}")
    @Size(max = 60, message = "{event.size.message}")
    private String event;

    @Schema(example = "primary")
    @Pattern(regexp = "^[a-z]+$", message = "{invalid.theme}")
    @Size(max = 60, message = "{theme.size.message}")
    private String theme;


    @Schema(example = "month")
    @NotNull(message = "{date.notnull.message}")
    @Pattern(regexp = "^\\d{2}$", message = "{invalid.date}")
    private String date;
}
