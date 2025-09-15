package com.atendopro.api.dto.clinical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
public class ClinicalRecordRequest {
    @NotNull
    private UUID patientId;
    @NotNull
    private UUID therapistId;
    @NotBlank
    private String notes;
}