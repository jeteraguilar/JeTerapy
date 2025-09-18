package com.atendopro.application.service;

import com.atendopro.api.dto.payment.*;
import com.atendopro.api.mapper.Mappers;
import com.atendopro.domain.entity.Payment;
import com.atendopro.domain.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository repo;

    public PaymentResponse create(PaymentRequest r) {
    // appointmentId agora pode ser null (pagamento independente de agendamento)
    var p = Payment.builder()
        .appointmentId(r.getAppointmentId())
        .amount(r.getAmount())
        .method(r.getMethod())
        .consultationType(r.getConsultationType() == null || r.getConsultationType().isBlank() ? "TERAPIA" : r.getConsultationType())
        .dueDate(r.getDueDate())
        .build();
        return Mappers.toResp(repo.save(p));
    }

    public PaymentResponse get(UUID id) {
        return Mappers.toResp(repo.findById(id).orElseThrow());
    }

    public List<PaymentResponse> list() {
        return repo.findAll().stream().map(Mappers::toResp).toList();
    }

    public PaymentResponse markPaid(UUID id) {
        var p = repo.findById(id).orElseThrow();
        p.setStatus(Payment.Status.PAID);
        p.setPaidAt(java.time.LocalDateTime.now());
        return Mappers.toResp(repo.save(p));
    }

    public PaymentResponse update(UUID id, PaymentUpdateRequest r) {
        var p = repo.findById(id).orElseThrow();
        if (r.getAppointmentId() != null) p.setAppointmentId(r.getAppointmentId());
        if (r.getAmount() != null) p.setAmount(r.getAmount());
        if (r.getMethod() != null) p.setMethod(r.getMethod());
        if (r.getDueDate() != null) p.setDueDate(r.getDueDate());
        if (r.getStatus() != null) p.setStatus(r.getStatus());
        if (r.getConsultationType() != null && !r.getConsultationType().isBlank()) p.setConsultationType(r.getConsultationType());
        return Mappers.toResp(repo.save(p));
    }

    public void delete(UUID id) {
        repo.deleteById(id);
    }
}