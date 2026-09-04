package com.hestia.smarthome.repository;

import com.hestia.smarthome.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SensorRepository extends JpaRepository<Sensor, Long> {
    Optional<Sensor> findBySensorType(String sensorType);
}
