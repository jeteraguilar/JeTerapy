package com.atendopro.application.service;

import com.atendopro.api.dto.auth.*;
import com.atendopro.domain.entity.User;
import com.atendopro.domain.repository.UserRepository;
import com.atendopro.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;


@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
    public void register(RegisterUserRequest r){
        if (users.existsByEmail(r.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }
        users.save(User.builder().id(UUID.randomUUID()).name(r.getName()).email(r.getEmail())
                .password(encoder.encode(r.getPassword())).role(r.getRole()).active(true).build());
    }
    public AuthResponse login(AuthRequest r){
        var u = users.findByEmail(r.getEmail()).orElseThrow(()-> new IllegalArgumentException("Credenciais"));
        if (!encoder.matches(r.getPassword(), u.getPassword())) throw new IllegalArgumentException("Credenciais");
        return new AuthResponse(jwt.generateToken(u.getEmail()));
    }
}