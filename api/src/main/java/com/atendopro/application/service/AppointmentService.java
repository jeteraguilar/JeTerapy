package com.atendopro.application.service;

import com.atendopro.api.dto.appointment.*;
import com.atendopro.domain.entity.Appointment;
import com.atendopro.domain.enums.AppointmentStatus;
import com.atendopro.domain.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository repo;

    public AppointmentResponse create(AppointmentRequest r) {
        var a = Appointment.builder().therapistId(r.getTherapistId()).patientId(r.getPatientId())
                .startTime(r.getStartTime()).endTime(r.getEndTime()).location(r.getLocation()).status(AppointmentStatus.SCHEDULED).build();
        a = repo.save(a);
        return toResp(a);
    }

    public Page<AppointmentResponse> list(UUID therapistId, LocalDate from, LocalDate to, Pageable pg) {
        var start = from != null ? from.atStartOfDay() : LocalDate.now().minusDays(7).atStartOfDay();
        var end = to != null ? to.atTime(23, 59) : LocalDate.now().plusDays(30).atTime(23, 59);
        return repo.findByTherapistIdAndStartTimeBetweenOrderByStartTimeAsc(therapistId, start, end, pg).map(this::toResp);
    }

    public AppointmentResponse updateStatus(UUID id, AppointmentStatus status) {
        var a = repo.findById(id).orElseThrow();
        a.setStatus(status);
        return toResp(repo.save(a));
    }

    private AppointmentResponse toResp(Appointment a) {
        return new AppointmentResponse(a.getId(), a.getTherapistId(), a.getPatientId(), a.getStartTime(), a.getEndTime(), a.getStatus().name(), a.getLocation());
    }
}
