package com.atendopro.domain.repository;

import com.atendopro.domain.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;


public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    Page<Appointment> findByTherapistIdAndStartTimeBetweenOrderByStartTimeAsc(UUID therapistId, LocalDateTime from, LocalDateTime to, Pageable pageable);
}