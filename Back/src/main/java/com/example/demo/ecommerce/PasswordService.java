package com.example.demo.ecommerce;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(12);

    public String encode(String rawPassword) {
        return ENCODER.encode(rawPassword);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.isBlank()) {
            return false;
        }
        // Accept both BCrypt ($2a/$2b/$2y) and plain-text only during migration window.
        // Once migratePasswordsIfNeeded() has run, all hashes start with $2.
        if (!encodedPassword.startsWith("$2")) {
            return false;
        }
        return ENCODER.matches(rawPassword, encodedPassword);
    }
}
