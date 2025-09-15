package com.atendopro.domain.repository;

import com.atendopro.domain.entity.ClinicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClinicalRecordRepository extends JpaRepository<ClinicalRecord, UUID> {
    List<ClinicalRecord> findByPatientId(UUID patientId);
}
