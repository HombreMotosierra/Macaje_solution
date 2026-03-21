package com.example.demo.ecommerce;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private static final Set<String> ADMIN_ROLES = Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");

    private final JdbcTemplate jdbcTemplate;
    private final JwtService jwtService;
    private final PasswordService passwordService;

    public AdminAuthService(JdbcTemplate jdbcTemplate, JwtService jwtService, PasswordService passwordService) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
        this.passwordService = passwordService;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            throw new ApiException(400, "Correo y clave son obligatorios");
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        AuthRow user = jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE lower(u.email) = lower(?)
            """,
            rs -> rs.next()
                ? new AuthRow(
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getString("email"),
                    rs.getString("password_hash"),
                    rs.getBoolean("activo"),
                    rs.getString("rol")
                )
                : null,
            email
        );

        if (user == null || !user.active()) {
            throw new ApiException(401, "Credenciales invalidas");
        }

        if (!ADMIN_ROLES.contains(user.role())) {
            throw new ApiException(403, "Este usuario no tiene permisos administrativos");
        }

        if (!passwordService.matches(request.password(), user.passwordHash())) {
            throw new ApiException(401, "Credenciales invalidas");
        }

        String token = jwtService.generateToken(String.valueOf(user.id()), user.email(), user.role());
        long expiresAt = Instant.now().toEpochMilli() + jwtService.expirationMillis();

        jdbcTemplate.update(
            "INSERT INTO auditoria_admin (usuario_id, accion, detalle, created_at) VALUES (?, ?, ?, now())",
            user.id(),
            "LOGIN",
            "Inicio de sesion administrativo"
        );

        return new LoginResponse(token, "Bearer", expiresAt, user.name(), user.email(), user.role());
    }

    public AuthUserView requireAuthenticatedAdmin(String authorizationHeader, Set<String> allowedRoles) {
        String token = extractToken(authorizationHeader);
        Map<String, String> claims = jwtService.validateAndExtract(token);

        String email = claims.get("email");
        String role = claims.get("role");
        if (email == null || role == null) {
            throw new ApiException(401, "Token sin claims requeridos");
        }

        if (!allowedRoles.contains(role)) {
            throw new ApiException(403, "No tienes permisos para esta operacion");
        }

        AuthUserView user = jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE lower(u.email) = lower(?) AND u.activo = true
            """,
            rs -> rs.next()
                ? new AuthUserView(rs.getLong("id"), rs.getString("nombre"), rs.getString("email"), rs.getString("rol"))
                : null,
            email
        );

        if (user == null) {
            throw new ApiException(403, "Usuario administrador no encontrado o inactivo");
        }

        if (!allowedRoles.contains(user.roleName())) {
            throw new ApiException(403, "Rol de usuario no autorizado");
        }

        return user;
    }

    public Set<String> adminRoles() {
        return ADMIN_ROLES;
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ApiException(401, "Debes enviar Authorization: Bearer <token>");
        }

        String normalized = authorizationHeader.trim();
        if (!normalized.startsWith("Bearer ")) {
            throw new ApiException(401, "Formato de token invalido");
        }

        String token = normalized.substring(7).trim();
        if (token.isBlank()) {
            throw new ApiException(401, "Token vacio");
        }

        return token;
    }

    private record AuthRow(Long id, String name, String email, String passwordHash, boolean active, String role) {}
}
