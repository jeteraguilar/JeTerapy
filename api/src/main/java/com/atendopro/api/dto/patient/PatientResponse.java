package com.atendopro.api.dto.patient;

import lombok.*;

import java.util.UUID;
import java.time.Instant;

@Getter
@Setter
@Builder
public class PatientResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String notes;
    private Instant createdAt;
}