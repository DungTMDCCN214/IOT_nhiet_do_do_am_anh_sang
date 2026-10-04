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
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
            @RequestParam(required = false) Double value,
            @RequestParam(required = false) String time,
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
        LocalDateTime to = null;
        if (time != null && !time.isBlank()) {
            try {
                LocalDateTime selectedTime = parseSelectedTime(time);
                from = selectedTime;
                to = resolveSelectedTimeEnd(time, selectedTime);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        Pageable pageable = PageRequest.of(page, limit, Sort.by("recordedAt").descending());
        Page<DataSensor> result = dataSensorRepository.search(
                blankToNull(type),
                value,
                from,
                to,
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

    private LocalDateTime parseSelectedTime(String value) {
        String normalized = value.trim();
        if (normalized.matches("\\d{4}")) {
            return LocalDateTime.parse(normalized + "-01-01 00:00", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
        if (normalized.matches("\\d{2}/\\d{4}")) {
            return LocalDateTime.parse("01/" + normalized + " 00:00", DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        if (isDateOnly(normalized)) {
            DateTimeFormatter dateFormat = normalized.contains("/")
                    ? DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    : DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            return LocalDateTime.parse(normalized + " 00:00", dateFormat);
        }
        if (normalized.matches("\\d{2}/\\d{2}/\\d{4} \\d{2}")) {
            return LocalDateTime.parse(normalized + ":00", DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        try {
            return LocalDateTime.parse(normalized, DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDateTime.parse(normalized, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            } catch (DateTimeParseException ignoredAgain) {
                return LocalDateTime.parse(normalized, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            }
        }
    }

    private boolean isDateOnly(String value) {
        return value.trim().matches("\\d{2}/\\d{2}/\\d{4}|\\d{4}-\\d{2}-\\d{2}");
    }

    private LocalDateTime resolveSelectedTimeEnd(String value, LocalDateTime from) {
        String normalized = value.trim();
        if (normalized.matches("\\d{4}")) return from.plusYears(1);
        if (normalized.matches("\\d{2}/\\d{4}")) return from.plusMonths(1);
        if (isDateOnly(normalized)) return from.plusDays(1);
        if (normalized.matches("\\d{2}/\\d{2}/\\d{4} \\d{2}")) return from.plusHours(1);
        return from.plusMinutes(1);
    }
}
