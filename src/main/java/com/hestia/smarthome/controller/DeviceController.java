package com.hestia.smarthome.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hestia.smarthome.entity.Device;
import com.hestia.smarthome.entity.History;
import com.hestia.smarthome.entity.User;
import com.hestia.smarthome.mqtt.MqttGateway;
import com.hestia.smarthome.repository.DeviceRepository;
import com.hestia.smarthome.repository.HistoryRepository;
import com.hestia.smarthome.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceRepository deviceRepository;
    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final MqttGateway mqttGateway;
    private final ObjectMapper objectMapper;

    public DeviceController(DeviceRepository deviceRepository,
                             HistoryRepository historyRepository,
                             UserRepository userRepository,
                             MqttGateway mqttGateway) {
        this.deviceRepository = deviceRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.mqttGateway = mqttGateway;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Điều khiển thiết bị (Bật/Tắt)
     */
    @PostMapping("/{deviceId}/control")
    public ResponseEntity<Map<String, Object>> controlDevice(
            @PathVariable String deviceId,
            @RequestBody Map<String, String> body,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Kiểm tra đăng nhập
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Vui lòng đăng nhập để thực hiện thao tác này");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Kiểm tra action
            String action = body.get("action");
            if (action == null || (!action.equalsIgnoreCase("ON") && !action.equalsIgnoreCase("OFF"))) {
                response.put("success", false);
                response.put("message", "Action phải là ON hoặc OFF");
                return ResponseEntity.badRequest().body(response);
            }

            // Kiểm tra thiết bị tồn tại
            Device device = deviceRepository.findById(deviceId).orElse(null);
            if (device == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy thiết bị với ID: " + deviceId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Kiểm tra user tồn tại
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                session.invalidate();
                response.put("success", false);
                response.put("message", "Phiên đăng nhập không hợp lệ");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Lưu lịch sử
            History history = new History();
            history.setDevice(device);
            history.setUser(user);
            history.setAction(action.equalsIgnoreCase("ON") ? "Bật" : "Tắt");
            history.setStatus("Pending");
            history.setPerformedAt(LocalDateTime.now());
            historyRepository.save(history);

            // Gửi lệnh MQTT
            Map<String, String> payload = Map.of(
                "deviceId", deviceId, 
                "action", action.toUpperCase(),
                "timestamp", LocalDateTime.now().toString()
            );
            mqttGateway.publish("device/control", objectMapper.writeValueAsString(payload));

            // Trả về response
            response.put("success", true);
            response.put("deviceId", deviceId);
            response.put("status", "Pending");
            response.put("message", "Lệnh đã được gửi, đang chờ thiết bị phản hồi");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy danh sách toàn bộ thiết bị + trạng thái hiện tại
     */
    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        try {
            List<Device> devices = deviceRepository.findAll();
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy lịch sử điều khiển thiết bị với phân trang và bộ lọc
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String range,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            // Validate page và limit
            if (page < 0) page = 0;
            if (limit < 1 || limit > 100) limit = 10;

            // Xác định khoảng thời gian
            LocalDateTime from = null;
            if (range != null) {
                from = switch (range.toLowerCase()) {
                    case "hour" -> LocalDateTime.now().minusHours(1);
                    case "day" -> LocalDateTime.now().minusDays(1);
                    case "week" -> LocalDateTime.now().minusWeeks(1);
                    case "month" -> LocalDateTime.now().minusMonths(1);
                    default -> null;
                };
            }

            // Tạo Pageable
            Pageable pageable = PageRequest.of(page, limit, Sort.by("performedAt").descending());
            
            // Truy vấn lịch sử
            Page<History> result;
            if (keyword != null && !keyword.isEmpty()) {
                result = historyRepository.search(deviceId, keyword, from, pageable);
            } else {
                result = historyRepository.search(deviceId, from, pageable);
            }

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("data", result.getContent());
            response.put("total", result.getTotalElements());
            response.put("page", result.getNumber());
            response.put("totalPages", result.getTotalPages());
            response.put("limit", result.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra khi lấy lịch sử: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}