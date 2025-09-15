package com.atendopro.api.controller;

import com.atendopro.api.dto.clinical.*;
import com.atendopro.application.service.ClinicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/api/clinical-records")
public class ClinicalRecordController {
    private final ClinicalRecordService svc;

    public ClinicalRecordController(ClinicalRecordService s) {
        this.svc = s;
    }

    @PostMapping
    public ResponseEntity<ClinicalRecordResponse> create(@Valid @RequestBody ClinicalRecordRequest r) {
        return ResponseEntity.ok(svc.create(r));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalRecordResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(svc.get(id));
    }

    @GetMapping("/patient/{pid}")
    public ResponseEntity<List<ClinicalRecordResponse>> byPatient(@PathVariable UUID pid) {
        return ResponseEntity.ok(svc.listByPatient(pid));
    }
}
