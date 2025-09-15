package com.atendopro.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {
    @Id
    private UUID id;
    private String channel; // EMAIL | WHATSAPP
    @Column(name = "to_address")
    private String to;
    private String subject;
    @Column(columnDefinition = "TEXT")
    private String body;
    private String status; // SUCCESS | ERROR
    private String error;
    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void pre() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}