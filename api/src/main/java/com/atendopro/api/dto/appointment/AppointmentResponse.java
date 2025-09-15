package com.atendopro.api.dto.appointment;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(UUID id, UUID therapistId, UUID patientId, LocalDateTime start, LocalDateTime end,
                                  String status, String location) {
}