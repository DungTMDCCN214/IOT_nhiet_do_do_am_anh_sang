package com.hestia.smarthome.repository;

import com.hestia.smarthome.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceRepository extends JpaRepository<Device, String> {
}
