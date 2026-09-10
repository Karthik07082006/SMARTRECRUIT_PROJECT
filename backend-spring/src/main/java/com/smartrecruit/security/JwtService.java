package com.smartrecruit.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {
    private final SecretKey key;
    public JwtService(@Value("${smartrecruit.jwt-secret}") String secret) {
        String padded = (secret + "00000000000000000000000000000000");
        key = Keys.hmacShaKeyFor(padded.substring(0, 32).getBytes(StandardCharsets.UTF_8));
    }
    public String create(UUID id, String role) {
        return Jwts.builder().subject(id.toString()).claims(Map.of("role", role)).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L)).signWith(key).compact();
    }
    public io.jsonwebtoken.Claims parse(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
