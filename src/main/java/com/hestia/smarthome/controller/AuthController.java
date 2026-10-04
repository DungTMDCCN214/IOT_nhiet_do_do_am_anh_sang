package com.hestia.smarthome.controller;

import com.hestia.smarthome.entity.User;
import com.hestia.smarthome.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String email = body.get("email");
        String password = body.get("password");

        User user = userRepository.findByUsername(email).orElse(null);

        // Demo dang so sanh plain-text. Moi truong that nen dung BCryptPasswordEncoder.
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Sai email hoac mat khau"));
        }

        session.setAttribute("userId", user.getUserId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("fullName", user.getFullName());
        session.setAttribute("avatarUrl", user.getAvatarUrl());

        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true, "message", "Da dang xuat"));
    }
}
