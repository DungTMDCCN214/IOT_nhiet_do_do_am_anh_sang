package com.hestia.smarthome.controller;

import com.hestia.smarthome.entity.DataSensor;
import com.hestia.smarthome.entity.Sensor;
import com.hestia.smarthome.repository.DataSensorRepository;
import com.hestia.smarthome.repository.SensorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final DataSensorRepository dataSensorRepository;
    private final SensorRepository sensorRepository;

    public SensorController(DataSensorRepository dataSensorRepository, SensorRepository sensorRepository) {
        this.dataSensorRepository = dataSensorRepository;
        this.sensorRepository = sensorRepository;
    }

    @GetMapping
    public ResponseEntity<List<DataSensor>> getLatest(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(dataSensorRepository.findLatestPerType(blankToNull(type)));
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String range,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {

        if (page < 0) {
            page = 0;
        }
        if (limit < 1 || limit > 100) {
            limit = 10;
        }

        LocalDateTime from = resolveFromDate(range);
        Pageable pageable = PageRequest.of(page, limit, Sort.by("recordedAt").descending());
        Page<DataSensor> result = dataSensorRepository.search(
                blankToNull(type),
                blankToNull(keyword),
                from,
                pageable
        );

        return ResponseEntity.ok(Map.of(
                "data", result.getContent(),
                "total", result.getTotalElements(),
                "page", result.getNumber(),
                "totalPages", result.getTotalPages(),
                "limit", result.getSize()
        ));
    }

    @GetMapping("/chart")
    public ResponseEntity<List<DataSensor>> getChartData() {
        LocalDateTime from = LocalDateTime.now().minusHours(12);
        return ResponseEntity.ok(dataSensorRepository.findForChart(from));
    }

    @GetMapping("/status-summary")
    public ResponseEntity<Map<String, Object>> getStatusSummary() {
        List<Sensor> all = sensorRepository.findAll();
        long active = all.stream()
                .filter(sensor -> "ON".equalsIgnoreCase(sensor.getStatus()))
                .count();

        return ResponseEntity.ok(Map.of("active", active, "total", all.size()));
    }

    private LocalDateTime resolveFromDate(String range) {
        String normalizedRange = blankToNull(range);
        if (normalizedRange == null) {
            return null;
        }

        return switch (normalizedRange.toLowerCase()) {
            case "hour" -> LocalDateTime.now().minusHours(1);
            case "day" -> LocalDateTime.now().minusDays(1);
            case "week" -> LocalDateTime.now().minusWeeks(1);
            case "month" -> LocalDateTime.now().minusMonths(1);
            default -> null;
        };
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
