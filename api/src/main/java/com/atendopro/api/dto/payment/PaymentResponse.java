package com.atendopro.api.dto.payment;

import lombok.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Getter
@Setter
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID appointmentId;
    private BigDecimal amount;
    private String method;
    private String consultationType;
    private String status;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
}