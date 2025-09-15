package com.atendopro.domain.repository;

import com.atendopro.domain.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Patient> findByEmailIgnoreCase(String email);
}
