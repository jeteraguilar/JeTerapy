package com.atendopro.api.dto.auth;

import com.atendopro.domain.entity.Role;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class RegisterUserRequest {
    @NotBlank
    private String name;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotNull
    private Role role;
}
