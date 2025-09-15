package com.atendopro.api.dto.appointment;

import com.atendopro.domain.enums.AppointmentStatus;
import lombok.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class AppointmentRequest {
    @NotNull
    private UUID therapistId;
    @NotNull
    private UUID patientId;
    @NotNull
    private LocalDateTime startTime;
    @NotNull
    private LocalDateTime endTime;

    private String location;
    private AppointmentStatus status;
}