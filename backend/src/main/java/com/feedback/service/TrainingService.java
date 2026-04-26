package com.feedback.service;

import com.feedback.dto.CreateTrainingRequest;
import com.feedback.dto.TrainingListResponse;
import com.feedback.dto.TrainingResponse;
import com.feedback.dto.TrainerInfo;
import com.feedback.dto.TrainerListResponse;
import com.feedback.entity.Training;
import com.feedback.entity.User;
import com.feedback.repository.TrainingRepository;
import com.feedback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;

    @Transactional
    public TrainingResponse createTraining(CreateTrainingRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admin can create trainings");
        }

        User trainer = userRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != User.Role.TRAINER) {
            throw new RuntimeException("Selected user is not a trainer");
        }

        if (request.getSchedule().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Schedule must be a future date");
        }

        Training training = new Training();
        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        training.setTrainer(trainer);
        training.setSchedule(request.getSchedule());
        training.setCapacity(request.getCapacity());
        training.setCreatedBy(admin);

        Training saved = trainingRepository.save(training);
        return mapToResponse(saved);
    }

    public TrainingListResponse getAllTrainings() {
        List<Training> trainings = trainingRepository.findAll();
        List<TrainingResponse> responses = trainings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new TrainingListResponse(responses);
    }

    public TrainingResponse getTrainingById(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found"));
        return mapToResponse(training);
    }

    public TrainingListResponse getTrainingsByTrainerId(Long trainerId) {
        List<Training> trainings = trainingRepository.findByTrainerId(trainerId);
        List<TrainingResponse> responses = trainings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new TrainingListResponse(responses);
    }

    public TrainerListResponse getAllTrainers() {
        List<User> trainers = userRepository.findByRole(User.Role.TRAINER);
        List<TrainerInfo> trainerInfos = trainers.stream()
                .map(t -> new TrainerInfo(t.getId(), t.getName(), t.getEmail()))
                .collect(Collectors.toList());
        return new TrainerListResponse(trainerInfos);
    }

    private TrainingResponse mapToResponse(Training training) {
        TrainingResponse response = new TrainingResponse();
        response.setId(training.getId());
        response.setTitle(training.getTitle());
        response.setDescription(training.getDescription());
        response.setSchedule(training.getSchedule());
        response.setCapacity(training.getCapacity());
        response.setCreatedAt(training.getCreatedAt());

        if (training.getTrainer() != null) {
            response.setTrainerId(training.getTrainer().getId());
            response.setTrainerName(training.getTrainer().getName());
            response.setTrainerEmail(training.getTrainer().getEmail());
        }

        if (training.getCreatedBy() != null) {
            response.setCreatedBy(training.getCreatedBy().getId());
            response.setCreatedByName(training.getCreatedBy().getName());
        }

        return response;
    }
}