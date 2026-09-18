package com.hestia.smarthome.mqtt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hestia.smarthome.entity.DataSensor;
import com.hestia.smarthome.entity.Sensor;
import com.hestia.smarthome.repository.DataSensorRepository;
import com.hestia.smarthome.repository.SensorRepository;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class SensorDataListener {

    private final DataSensorRepository dataSensorRepository;
    private final SensorRepository sensorRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public SensorDataListener(DataSensorRepository dataSensorRepository,
                              SensorRepository sensorRepository,
                              SimpMessagingTemplate messagingTemplate,
                              ObjectMapper objectMapper) {
        this.dataSensorRepository = dataSensorRepository;
        this.sensorRepository = sensorRepository;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @ServiceActivator(inputChannel = "mqttSensorInputChannel")
    public void handleMessage(String payload) {
        try {
            JsonNode json = objectMapper.readTree(payload);
            if (json.hasNonNull("sensorType") && json.hasNonNull("value")) {
                saveReading(json.get("sensorType").asText(), json.get("value").asDouble());
                return;
            }

            Map<String, String> fields = Map.of(
                    "temp", "temperature",
                    "hum", "humidity",
                    "light", "light");
            fields.forEach((field, sensorType) -> {
                JsonNode value = json.get(field);
                if (value != null && value.isNumber()) {
                    saveReading(sensorType, value.asDouble());
                }
            });
        } catch (Exception e) {
            System.err.println("MQTT sensor message could not be processed: " + e.getMessage());
        }
    }

    private void saveReading(String sensorType, double value) {
        if (!Double.isFinite(value)) {
            return;
        }

        Sensor sensor = sensorRepository.findBySensorType(sensorType).orElse(null);
        if (sensor == null) {
            System.err.println("Sensor is missing from database: " + sensorType);
            return;
        }

        DataSensor record = new DataSensor();
        record.setSensor(sensor);
        record.setValue(value);
        record.setRecordedAt(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/sensors", dataSensorRepository.save(record));
    }
}
