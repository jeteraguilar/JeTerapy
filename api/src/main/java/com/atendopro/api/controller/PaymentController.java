package com.atendopro.api.controller;

import com.atendopro.api.dto.payment.*;
import com.atendopro.application.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService svc;

    public PaymentController(PaymentService s) {
        this.svc = s;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(@Valid @RequestBody PaymentRequest r) {
        return ResponseEntity.ok(svc.create(r));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(svc.get(id));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> list() {
        return ResponseEntity.ok(svc.list());
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> pay(@PathVariable UUID id) {
        return ResponseEntity.ok(svc.markPaid(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> update(@PathVariable UUID id, @Valid @RequestBody PaymentUpdateRequest r) {
        return ResponseEntity.ok(svc.update(id, r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}
