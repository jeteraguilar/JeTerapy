package com.atendopro.application.service;

import com.atendopro.api.dto.auth.RegisterUserRequest;
import com.atendopro.api.dto.auth.AuthRequest;
import com.atendopro.api.dto.auth.AuthResponse;
import com.atendopro.domain.entity.Role;
import com.atendopro.domain.entity.User;
import com.atendopro.domain.repository.UserRepository;
import com.atendopro.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {
    @Test void register_duplicateEmail_throws(){
        var repo = Mockito.mock(UserRepository.class);
        var enc = Mockito.mock(PasswordEncoder.class);
        var jwt = Mockito.mock(JwtService.class);
        Mockito.when(repo.existsByEmail("dup@mail.com")).thenReturn(true);

        var svc = new AuthService(repo, enc, jwt);
        var req = new RegisterUserRequest();
        req.setName("Ana"); req.setEmail("dup@mail.com"); req.setPassword("123"); req.setRole(Role.ADMIN);

        assertThrows(IllegalArgumentException.class, () -> svc.register(req));
    }

    @Test void register_newEmail_saves(){
        var repo = Mockito.mock(UserRepository.class);
        var enc = Mockito.mock(PasswordEncoder.class);
        var jwt = Mockito.mock(JwtService.class);
        Mockito.when(repo.existsByEmail("new@mail.com")).thenReturn(false);
        Mockito.when(enc.encode("123")).thenReturn("encoded");

        var svc = new AuthService(repo, enc, jwt);
        var req = new RegisterUserRequest();
        req.setName("Ana"); req.setEmail("new@mail.com"); req.setPassword("123"); req.setRole(Role.ADMIN);

        svc.register(req);
        Mockito.verify(repo).save(Mockito.any(User.class));
    }

    @Test void login_ok(){
        var repo = Mockito.mock(UserRepository.class);
        var enc = Mockito.mock(PasswordEncoder.class);
        var jwt = Mockito.mock(JwtService.class);
        var user = User.builder().id(UUID.randomUUID()).email("ana@mail.com").password("encoded").role(Role.ADMIN).build();
        Mockito.when(repo.findByEmail("ana@mail.com")).thenReturn(Optional.of(user));
        Mockito.when(enc.matches("123","encoded")).thenReturn(true);
        Mockito.when(jwt.generateToken("ana@mail.com")).thenReturn("token123");

        var svc = new AuthService(repo, enc, jwt);
        AuthResponse resp = svc.login(new AuthRequest("ana@mail.com","123"));
        assertEquals("token123", resp.getToken());
    }

    @Test void login_wrongPassword_throws(){
        var repo = Mockito.mock(UserRepository.class);
        var enc = Mockito.mock(PasswordEncoder.class);
        var jwt = Mockito.mock(JwtService.class);
        var user = User.builder().id(UUID.randomUUID()).email("ana@mail.com").password("encoded").role(Role.ADMIN).build();
        Mockito.when(repo.findByEmail("ana@mail.com")).thenReturn(Optional.of(user));
        Mockito.when(enc.matches("wrong","encoded")).thenReturn(false);

        var svc = new AuthService(repo, enc, jwt);
        assertThrows(IllegalArgumentException.class, () -> svc.login(new AuthRequest("ana@mail.com","wrong")));
    }
}
