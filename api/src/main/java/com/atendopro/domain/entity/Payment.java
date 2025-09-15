package com.atendopro.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    public enum Status {PENDING, PAID, LATE}

    @Id
    private UUID id;
    @Column(name = "appointment_id")
    private UUID appointmentId;
    private BigDecimal amount;
    private String method;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Column(name = "due_date")
    private LocalDate dueDate;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    void pre() {
        if (id == null) id = UUID.randomUUID();
        if (status == null) status = Status.PENDING;
    }
}