package com.atendopro.application.service;

import com.atendopro.api.dto.patient.*;
import com.atendopro.domain.entity.Patient;
import com.atendopro.domain.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository repo;

    public PatientResponse create(PatientRequest r) {
        if (r.getEmail() != null && !r.getEmail().isBlank()) {
            repo.findByEmailIgnoreCase(r.getEmail()).ifPresent(p -> {
                throw new IllegalArgumentException("Já existe um paciente cadastrado com este e-mail.");
            });
        }
    var p = Patient.builder()
        .name(r.getName())
        .email(r.getEmail())
        .phone(r.getPhone())
        .notes(r.getNotes())
        .contractType(r.getContractType() == null || r.getContractType().isBlank() ? "INDIVIDUAL" : r.getContractType())
        .build();
        p = repo.save(p);
        return toResp(p);
    }

    public PatientResponse get(UUID id) {
        var p = repo.findById(id).orElseThrow();
        return toResp(p);
    }

    public Page<PatientResponse> list(String q, Pageable pg) {
        var page = (q == null || q.isBlank()) ? repo.findAll(pg) : repo.findByNameContainingIgnoreCase(q, pg);
        return page.map(this::toResp);
    }

    public PatientResponse update(UUID id, PatientRequest r) {
        var p = repo.findById(id).orElseThrow();
        if (r.getEmail() != null && !r.getEmail().isBlank()) {
            repo.findByEmailIgnoreCase(r.getEmail()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new IllegalArgumentException("Já existe um paciente cadastrado com este e-mail.");
                }
            });
        }
        p.setName(r.getName());
        p.setEmail(r.getEmail());
        p.setPhone(r.getPhone());
        p.setNotes(r.getNotes());
        if (r.getContractType() != null && !r.getContractType().isBlank()) {
            p.setContractType(r.getContractType());
        }
        return toResp(repo.save(p));
    }

    public void delete(UUID id) {
        repo.deleteById(id);
    }

    private PatientResponse toResp(Patient p) {
    return PatientResponse.builder()
        .id(p.getId())
        .name(p.getName())
        .email(p.getEmail())
        .phone(p.getPhone())
        .notes(p.getNotes())
        .contractType(p.getContractType())
        .createdAt(p.getCreatedAt())
        .build();
    }
}
