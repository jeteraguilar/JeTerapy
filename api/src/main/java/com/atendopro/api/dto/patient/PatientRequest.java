package com.atendopro.api.dto.patient;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class PatientRequest {
    @NotBlank
    private String name;
    private String email;
    private String phone;
    private String notes;
}