package com.hestia.smarthome.controller;

import com.hestia.smarthome.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Chua dang nhap"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> {
                    session.invalidate();
                    return ResponseEntity.status(401)
                            .body(Map.of("success", false, "message", "Phien dang nhap khong hop le"));
                });
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id, HttpSession session) {
        Long sessionUserId = (Long) session.getAttribute("userId");
        if (sessionUserId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Chua dang nhap"));
        }

        if (!sessionUserId.equals(id)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Khong co quyen xem thong tin nguoi dung nay"));
        }

        return userRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/me/regenerate-api-key")
    public ResponseEntity<?> regenerateApiKey(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Chưa đăng nhập");
        }

        return userRepository.findById(userId)
                .map(user -> {
                    user.setApiKey("sk-" + java.util.UUID.randomUUID().toString().replace("-", ""));
                    userRepository.save(user);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
