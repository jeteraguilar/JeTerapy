package com.atendopro.api.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor   // ✅ gera construtor com todos os argumentos
@NoArgsConstructor    // ✅ gera construtor vazio
public class AuthRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
