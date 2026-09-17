package com.smartrecruit.api;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "ok", true,
                "service", "smartrecruit-api",
                "framework", "spring-boot",
                "message", "Use /api/health or /api/auth/login");
    }
}