package com.hestia.smarthome.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Sensors")
@Data
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sensor_id")
    private Long sensorId;

    @Column(name = "sensor_code", unique = true)
    private String sensorCode; // VD: "CB-TEMP-01"

    @Column(name = "sensor_type")
    private String sensorType; // "temperature" | "humidity" | "light"

    private String unit; // "°C" | "%" | "Lux"

    private String status; // "ON" | "OFF" — cảm biến có đang hoạt động không
}
