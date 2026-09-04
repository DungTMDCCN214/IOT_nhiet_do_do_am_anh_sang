package com.hestia.smarthome.mqtt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hestia.smarthome.entity.DataSensor;
import com.hestia.smarthome.entity.Device;
import com.hestia.smarthome.entity.Sensor;
import com.hestia.smarthome.repository.DataSensorRepository;
import com.hestia.smarthome.repository.DeviceRepository;
import com.hestia.smarthome.repository.HistoryRepository;
import com.hestia.smarthome.repository.SensorRepository;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Lắng nghe 2 loại message từ ESP8266 (qua kênh mqttInputChannel):
 *  - topic "sensor/data"  : dữ liệu cảm biến định kỳ -> lưu vào bảng DataSensors  (UC01, UC03, UC05)
 *  - topic "device/status": kết quả thực thi lệnh điều khiển -> cập nhật History + Devices (UC02)
 */
@Component
public class SensorDataListener {

    private final SensorRepository sensorRepository;
    private final DataSensorRepository dataSensorRepository;
    private final HistoryRepository historyRepository;
    private final DeviceRepository deviceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SensorDataListener(SensorRepository sensorRepository,
                               DataSensorRepository dataSensorRepository,
                               HistoryRepository historyRepository,
                               DeviceRepository deviceRepository) {
        this.sensorRepository = sensorRepository;
        this.dataSensorRepository = dataSensorRepository;
        this.historyRepository = historyRepository;
        this.deviceRepository = deviceRepository;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<String> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload();

        try {
            JsonNode json = objectMapper.readTree(payload);

            if ("sensor/data".equals(topic)) {
                saveSensorData(json);
            } else if ("device/status".equals(topic)) {
                updateDeviceStatus(json);
            }
        } catch (Exception e) {
            System.err.println("Lỗi xử lý bản tin MQTT (" + topic + "): " + e.getMessage());
        }
    }

    private void saveSensorData(JsonNode json) {
        String sensorType = json.get("sensorType").asText();
        double value = json.get("value").asDouble();

        if (Double.isNaN(value)) return; // dữ liệu không hợp lệ -> bỏ qua

        Sensor sensor = sensorRepository.findBySensorType(sensorType).orElse(null);
        if (sensor == null) {
            System.err.println("Không tìm thấy cảm biến loại: " + sensorType + " trong CSDL.");
            return;
        }

        DataSensor record = new DataSensor();
        record.setSensor(sensor);
        record.setValue(value);
        record.setRecordedAt(LocalDateTime.now());
        dataSensorRepository.save(record);
    }

    private void updateDeviceStatus(JsonNode json) {
        String deviceId = json.get("deviceId").asText();
        String result = json.get("result").asText(); // "SUCCESS" | "FAILED"

        Device device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) return;

        historyRepository.findTopByDevice_DeviceIdAndStatusOrderByPerformedAtDesc(deviceId, "Pending")
                .ifPresent(history -> {
                    boolean success = "SUCCESS".equals(result);
                    history.setStatus(success ? "Success" : "Error");
                    historyRepository.save(history);

                    if (success) {
                        device.setCurrentStatus(history.getAction().equalsIgnoreCase("Bật") ? "ON" : "OFF");
                        deviceRepository.save(device);
                    }
                });
    }
}
