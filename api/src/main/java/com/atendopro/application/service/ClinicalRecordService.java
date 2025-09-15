package com.atendopro.application.service;

import com.atendopro.api.dto.clinical.*;
import com.atendopro.api.mapper.Mappers;
import com.atendopro.domain.entity.ClinicalRecord;
import com.atendopro.domain.repository.ClinicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
@RequiredArgsConstructor
public class ClinicalRecordService {
    private final ClinicalRecordRepository repo;

    public ClinicalRecordResponse create(ClinicalRecordRequest r) {
        var cr = ClinicalRecord.builder().patientId(r.getPatientId()).therapistId(r.getTherapistId()).notes(r.getNotes()).build();
        return Mappers.toResp(repo.save(cr));
    }

    public ClinicalRecordResponse get(UUID id) {
        return Mappers.toResp(repo.findById(id).orElseThrow());
    }

    public List<ClinicalRecordResponse> listByPatient(UUID pid) {
        return repo.findByPatientId(pid).stream().map(Mappers::toResp).toList();
    }
}