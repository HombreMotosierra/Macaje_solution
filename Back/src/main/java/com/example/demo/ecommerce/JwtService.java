package com.example.demo.ecommerce;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_SECRET_LENGTH = 32;

    private final String secret;
    private final long expirationMillis;

    public JwtService(
        @Value("${app.jwt.secret:CHANGE_ME_SUPER_SECRET_KEY}") String secret,
        @Value("${app.jwt.expiration-millis:28800000}") long expirationMillis
    ) {
        if (secret.length() < MIN_SECRET_LENGTH
                || secret.startsWith("CHANGE_ME")
                || secret.equals("MACAJE_JWT_SECRET_2026_CHANGE_THIS")) {
            log.warn("SECURITY WARNING: app.jwt.secret is too short or is a default/placeholder value. " +
                     "Set a strong random secret of at least {} characters in production.", MIN_SECRET_LENGTH);
        }
        this.secret = secret;
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(String userId, String email, String roleName) {
        long now = Instant.now().toEpochMilli();
        long exp = now + expirationMillis;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = "{\"sub\":\"" + escape(userId) + "\",\"email\":\"" + escape(email)
            + "\",\"role\":\"" + escape(roleName) + "\",\"iat\":" + now + ",\"exp\":" + exp + "}";

        String header = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
        String payload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String content = header + "." + payload;
        String signature = hmacSha256(content, secret);
        return content + "." + signature;
    }

    public Map<String, String> validateAndExtract(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ApiException(401, "Token invalido");
        }

        String content = parts[0] + "." + parts[1];
        String expectedSignature = hmacSha256(content, secret);
        if (!expectedSignature.equals(parts[2])) {
            throw new ApiException(401, "Firma de token invalida");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        Map<String, String> claims = parseSimpleJson(payload);

        String expText = claims.get("exp");
        if (expText == null) {
            throw new ApiException(401, "Token sin expiracion");
        }

        long exp = Long.parseLong(expText);
        if (Instant.now().toEpochMilli() > exp) {
            throw new ApiException(401, "Token expirado");
        }

        return claims;
    }

    public long expirationMillis() {
        return expirationMillis;
    }

    private String hmacSha256(String value, String key) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKey);
            return base64UrlEncode(hmac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new ApiException(500, "No se pudo firmar el token");
        }
    }

    private String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private Map<String, String> parseSimpleJson(String payload) {
        Map<String, String> claims = new LinkedHashMap<>();
        String normalized = payload.trim();
        if (normalized.startsWith("{")) {
            normalized = normalized.substring(1);
        }
        if (normalized.endsWith("}")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        if (normalized.isBlank()) {
            return claims;
        }

        String[] pairs = normalized.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length != 2) {
                continue;
            }
            String key = unquote(keyValue[0].trim());
            String value = unquote(keyValue[1].trim());
            claims.put(key, value);
        }

        return claims;
    }

    private String unquote(String value) {
        String result = value;
        if (result.startsWith("\"") && result.endsWith("\"")) {
            result = result.substring(1, result.length() - 1);
        }
        return result.replace("\\\"", "\"");
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
