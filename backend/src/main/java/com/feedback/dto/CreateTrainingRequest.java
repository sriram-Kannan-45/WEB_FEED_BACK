package com.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateTrainingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    @NotNull(message = "Schedule is required")
    private LocalDateTime schedule;

    private Integer capacity;
}