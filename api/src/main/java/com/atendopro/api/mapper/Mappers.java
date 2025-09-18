package com.atendopro.api.mapper;

import com.atendopro.domain.entity.*;
import com.atendopro.api.dto.clinical.*;
import com.atendopro.api.dto.payment.*;


public class Mappers {
    public static ClinicalRecordResponse toResp(ClinicalRecord c) {
        return ClinicalRecordResponse.builder().id(c.getId()).patientId(c.getPatientId()).therapistId(
                c.getTherapistId()).notes(c.getNotes()).createdAt(c.getCreatedAt()).build();
    }

    public static PaymentResponse toResp(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .amount(p.getAmount())
                .method(p.getMethod())
                .consultationType(p.getConsultationType())
                .status(p.getStatus() == null ? null : p.getStatus().name())
                .dueDate(p.getDueDate())
                .paidAt(p.getPaidAt())
                .build();
    }
}