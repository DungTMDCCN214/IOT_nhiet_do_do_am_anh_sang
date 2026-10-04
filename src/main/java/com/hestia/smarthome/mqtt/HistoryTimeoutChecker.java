package com.hestia.smarthome.mqtt;

import com.hestia.smarthome.entity.Device;
import com.hestia.smarthome.entity.History;
import com.hestia.smarthome.repository.DeviceRepository;
import com.hestia.smarthome.repository.HistoryRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class HistoryTimeoutChecker {

    private static final long TIMEOUT_SECONDS = 15;

    private final HistoryRepository historyRepository;
    private final DeviceRepository deviceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public HistoryTimeoutChecker(HistoryRepository historyRepository,
                                 DeviceRepository deviceRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.historyRepository = historyRepository;
        this.deviceRepository = deviceRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedDelay = 1000)
    public void checkTimeouts() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);
        List<History> overdue = historyRepository.findByStatusAndPerformedAtBefore("Pending", threshold);

        for (History history : overdue) {
            history.setStatus("Error");
            historyRepository.save(history);

            Device device = history.getDevice();
            device.setCurrentStatus(resolvePreviousStatus(history));
            Device savedDevice = deviceRepository.save(device);
            messagingTemplate.convertAndSend("/topic/devices", savedDevice);

            System.out.println("Device command timed out after " + TIMEOUT_SECONDS
                    + " seconds: " + device.getDeviceId());
        }
    }

    private String resolvePreviousStatus(History history) {
        String previousStatus = history.getPreviousStatus();
        if ("ON".equalsIgnoreCase(previousStatus) || "OFF".equalsIgnoreCase(previousStatus)) {
            return previousStatus.toUpperCase();
        }

        return "Bật".equalsIgnoreCase(history.getAction()) ? "OFF" : "ON";
    }
}
