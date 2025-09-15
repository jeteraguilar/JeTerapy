package com.atendopro.application.service;

import com.atendopro.application.service.MailService;
import com.atendopro.infrastructure.whatsapp.TwilioWhatsappClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final MailService mail;
    private final TwilioWhatsappClient whats;

    public void sendEmail(String to, String subject, String body) {
        mail.send(to, subject, body);
    }

    public void sendWhatsapp(String to, String msg) {
        whats.send(to, msg);
    }
}