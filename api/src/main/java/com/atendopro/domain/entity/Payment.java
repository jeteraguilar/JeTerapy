package com.atendopro.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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
@DynamicInsert
public class Payment {
    public enum Status {PENDING, PAID, LATE}

    @Id
    private UUID id;
    @Column(name = "appointment_id")
    private UUID appointmentId;
    private BigDecimal amount;
    private String method;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "payment_status")
    private Status status;
    @Column(name = "due_date")
    private LocalDate dueDate;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    void pre() {
        if (id == null) id = UUID.randomUUID();
        // status: manter null para permitir DEFAULT do banco (via @DynamicInsert)
    }
}