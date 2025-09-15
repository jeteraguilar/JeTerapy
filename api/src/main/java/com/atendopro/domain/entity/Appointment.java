package com.atendopro.domain.entity;

import com.atendopro.domain.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    private UUID id;

    @Column(name = "therapist_id")
    private UUID therapistId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "appointment_status default 'SCHEDULED'")
    private AppointmentStatus status;

    private String location;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void pre() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = AppointmentStatus.SCHEDULED;
    }
}