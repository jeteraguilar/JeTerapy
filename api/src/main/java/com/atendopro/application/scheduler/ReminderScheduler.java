package com.atendopro.application.scheduler;

import com.atendopro.application.service.MailService;
import com.atendopro.domain.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;


@Component
@EnableScheduling
@RequiredArgsConstructor
public class ReminderScheduler {
    private final AppointmentRepository appts;
    private final MailService mail; // WhatsApp idem

    @Scheduled(cron = "0 0 * * * *") // a cada hora
    public void run() {
        var now = LocalDateTime.now();
        var target = now.plusHours(24);
// Exemplo: buscar appointments para lembrar (adicione query específica no repo conforme sua necessidade)
// mail.send(...)
    }
}