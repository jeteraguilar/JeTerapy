package com.atendopro.api.dto.clinical;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ClinicalRecordResponse {
    private UUID id;
    private UUID patientId;
    private UUID therapistId;
    private String notes;
    private Instant createdAt;
}