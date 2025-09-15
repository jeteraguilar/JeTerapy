package com.atendopro.api.controller;

import com.atendopro.api.dto.appointment.*;
import com.atendopro.application.service.AppointmentService;
import com.atendopro.domain.entity.Appointment;
import com.atendopro.domain.enums.AppointmentStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;


@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;

    public AppointmentController(AppointmentService s) {
        this.service = s;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody AppointmentRequest r) {
        return ResponseEntity.ok(service.create(r));
    }

    @GetMapping
    public Page<AppointmentResponse> list(@RequestParam UUID therapistId, @RequestParam(required = false) String from, @RequestParam(required = false) String to, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        var f = from != null ? LocalDate.parse(from) : null;
        var t = to != null ? LocalDate.parse(to) : null;
        return service.list(therapistId, f, t, PageRequest.of(page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> status(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, AppointmentStatus.valueOf(status)));
    }
}
