package com.atendopro.infrastructure.whatsapp;

// POC simples: configurar envs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
// Em dev, use o Twilio Sandbox


import com.atendopro.domain.entity.NotificationLog;
import com.atendopro.domain.repository.NotificationLogRepository;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class TwilioWhatsappClient {
    @Value("${TWILIO_ACCOUNT_SID:}")
    private String sid;
    @Value("${TWILIO_AUTH_TOKEN:}")
    private String token;
    @Value("${TWILIO_WHATSAPP_FROM:whatsapp:+14155238886}")
    private String from;
    private final NotificationLogRepository logs;

    public void send(String toPhoneE164, String text) {
        try {
            Twilio.init(sid, token);
            Message.creator(new com.twilio.type.PhoneNumber("whatsapp:" + toPhoneE164), new com.twilio.type.PhoneNumber(from), text).create();
            logs.save(NotificationLog.builder().channel("WHATSAPP").to(toPhoneE164).body(text).status("SUCCESS").build());
        } catch (Exception ex) {
            logs.save(NotificationLog.builder().channel("WHATSAPP").to(toPhoneE164).body(text).status("ERROR").error(ex.getMessage()).build());
        }
    }
}
