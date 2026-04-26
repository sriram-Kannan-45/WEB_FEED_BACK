package com.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingResponse {
    private Long id;
    private String title;
    private String description;
    private Long trainerId;
    private String trainerName;
    private String trainerEmail;
    private LocalDateTime schedule;
    private Integer capacity;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}