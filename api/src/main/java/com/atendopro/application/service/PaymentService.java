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
        var p = Payment.builder().appointmentId(r.getAppointmentId()).amount(r.getAmount()).method(r.getMethod()).dueDate(r.getDueDate()).build();
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
}