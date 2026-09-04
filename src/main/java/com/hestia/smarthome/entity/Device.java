package com.hestia.smarthome.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "Devices")
@Data
public class Device {

    @Id
    @Column(name = "device_id")
    private String deviceId; // VD: "DV-001" — dùng String để khớp mã cứng trong firmware

    @Column(name = "device_name")
    private String deviceName; // VD: "Đèn phòng khách"

    @Column(name = "current_status")
    private String currentStatus; // "ON" | "OFF"

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
