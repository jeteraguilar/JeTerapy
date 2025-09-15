package com.atendopro.application.service;

import com.atendopro.domain.entity.NotificationLog;
import com.atendopro.domain.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mail;
    private final NotificationLogRepository logs;

    public void send(String to, String subject, String body) {
        try {
            var msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mail.send(msg);
            logs.save(NotificationLog.builder().channel("EMAIL").to(to).subject(subject).body(body).status("SUCCESS").build());
        } catch (Exception ex) {
            logs.save(NotificationLog.builder().channel("EMAIL").to(to).subject(subject).body(body).status("ERROR").error(ex.getMessage()).build());
            throw ex;
        }
    }
}
