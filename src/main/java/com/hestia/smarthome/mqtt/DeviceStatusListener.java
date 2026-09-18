package com.hestia.smarthome.mqtt;

import com.hestia.smarthome.entity.Device;
import com.hestia.smarthome.repository.DeviceRepository;
import com.hestia.smarthome.repository.HistoryRepository;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class DeviceStatusListener {

    private final DeviceRepository deviceRepository;
    private final HistoryRepository historyRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public DeviceStatusListener(DeviceRepository deviceRepository,
                                HistoryRepository historyRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.deviceRepository = deviceRepository;
        this.historyRepository = historyRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @ServiceActivator(inputChannel = "mqttDeviceStatusInputChannel")
    public void handleStatus(String payload) {
        String[] parts = payload.trim().toUpperCase().split("_", 2);
        if (parts.length != 2 || !("ON".equals(parts[1]) || "OFF".equals(parts[1]))) {
            System.err.println("Invalid LED status from ESP8266: " + payload);
            return;
        }

        Device device = findDevice(parts[0]);
        if (device == null) {
            System.err.println("No database device matches LED status: " + payload);
            return;
        }

        historyRepository.findTopByDevice_DeviceIdAndStatusOrderByPerformedAtDesc(
                device.getDeviceId(), "Pending").ifPresent(history -> {
            history.setStatus("Success");
            historyRepository.save(history);
        });

        device.setCurrentStatus(parts[1]);
        messagingTemplate.convertAndSend("/topic/devices", deviceRepository.save(device));
    }

    private Device findDevice(String firmwareDeviceId) {
        String legacyId = switch (firmwareDeviceId) {
            case "RED" -> "1";
            case "GREEN" -> "2";
            case "YELLOW" -> "3";
            default -> null;
        };

        return deviceRepository.findById(firmwareDeviceId)
                .or(() -> legacyId == null ? java.util.Optional.empty() : deviceRepository.findById(legacyId))
                .orElse(null);
    }
}
