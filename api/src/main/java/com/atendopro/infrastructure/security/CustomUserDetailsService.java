package com.atendopro.infrastructure.security;

import com.atendopro.domain.entity.User;
import com.atendopro.domain.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import com.atendopro.domain.entity.Role;




@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository repo;

    public CustomUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = repo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("user"));
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail()).password(u.getPassword())
                .roles(u.getRole().name()).disabled(!u.isActive()).build();
    }
}