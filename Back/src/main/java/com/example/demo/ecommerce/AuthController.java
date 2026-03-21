package com.example.demo.ecommerce;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminAuthService adminAuthService;

    public AuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return adminAuthService.login(request);
    }

    @GetMapping("/me")
    public AuthUserView me(@RequestHeader("Authorization") String authorizationHeader) {
        return adminAuthService.requireAuthenticatedAdmin(authorizationHeader, adminAuthService.adminRoles());
    }
}
