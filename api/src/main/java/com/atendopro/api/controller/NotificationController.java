package com.atendopro.api.controller;

import com.atendopro.application.service.MailService;
import com.atendopro.infrastructure.whatsapp.TwilioWhatsappClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final MailService mail;
    private final TwilioWhatsappClient whats;

    public NotificationController(MailService m, TwilioWhatsappClient w) {
        this.mail = m;
        this.whats = w;
    }

    @PostMapping("/email/test")
    public ResponseEntity<Void> email(@RequestParam String to) {
        mail.send(to, "Teste ATendoPro", "Hello!");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/whatsapp/test")
    public ResponseEntity<Void> wa(@RequestParam String toE164) {
        whats.send(toE164, "Teste ATendoPro");
        return ResponseEntity.ok().build();
    }
}