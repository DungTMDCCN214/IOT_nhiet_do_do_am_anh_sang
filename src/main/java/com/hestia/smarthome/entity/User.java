package com.hestia.smarthome.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "full_name")
    private String fullName;

    private String username; // dùng làm email đăng nhập

    private String password; // LƯU Ý: demo đang lưu plain-text, môi trường thật phải hash (BCrypt)

    private String role; // VD: "Sinh viên"

    private String github;

    private String figma;

    private String school;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "api_key")
    private String apiKey;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
