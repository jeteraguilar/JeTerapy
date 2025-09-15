package com.atendopro.application.service;

import com.atendopro.infrastructure.whatsapp.TwilioWhatsappClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WhatsappService {
    private final TwilioWhatsappClient client;

    public void send(String to, String msg) {
        client.send(to, msg);
    }
}
