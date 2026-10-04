package com.hestia.smarthome.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "History")
@Data
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id")
    private Device device;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    private String action; // "Bật" | "Tắt"

    private String status; // "Pending" | "Success" | "Error"

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "performed_at")
    private LocalDateTime performedAt;
}
