package com.atendopro.api.dto.payment;

import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class PaymentRequest {
    @NotNull
    @JsonAlias({"appointment_id"})
    private UUID appointmentId;
    @NotNull
    @DecimalMin("0.0")
    private BigDecimal amount;
    @JsonAlias({"payment_method"})
    private String method;
    @JsonAlias({"due_date"})
    private LocalDate dueDate;
}