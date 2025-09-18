package com.atendopro.api.dto.payment;

import com.atendopro.domain.entity.Payment;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PaymentUpdateRequest {
    @JsonAlias({"appointment_id"})
    private java.util.UUID appointmentId; // opcional
    private BigDecimal amount;            // opcional
    @JsonAlias({"payment_method"})
    private String method;               // opcional
    @JsonAlias({"due_date"})
    private LocalDate dueDate;           // opcional
    private Payment.Status status;       // opcional
    @JsonAlias({"consultation_type"})
    private String consultationType;     // opcional
}
