package com.atendopro.infrastructure.config;

import org.springframework.context.annotation.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.*;

@Configuration
public class MailConfig {
    @Bean
    public JavaMailSender mailSender() {
        return new JavaMailSenderImpl();
    }
}