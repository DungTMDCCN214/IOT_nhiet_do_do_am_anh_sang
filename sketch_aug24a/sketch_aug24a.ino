/*
 * Hestia SmartHome - Firmware cho ESP8266/ESP32
 * Tác giả: Trần Mạnh Dũng - B23DCCN214
 * 
 * Chức năng:
 * - Đọc dữ liệu từ 3 cảm biến: DHT11 (nhiệt độ, độ ẩm) + LDR (ánh sáng)
 * - Bật/Tắt từng cảm biến qua MQTT
 * - Nếu cảm biến bị TẮT thì không gửi dữ liệu lên MQTT
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ===== CẤU HÌNH WI-FI =====
const char* WIFI_SSID = "Mang Chua";
const char* WIFI_PASSWORD = "22226666";

// ===== CẤU HÌNH MQTT =====
const char* MQTT_BROKER = "192.168.0.104";
const int MQTT_PORT = 1883;

// ===== TOPIC MQTT =====
const char* TOPIC_SENSOR_DATA = "sensor_data";
const char* TOPIC_DEVICE_CONTROL = "device_control";
const char* TOPIC_DEVICE_STATUS = "device_status";

// ===== ĐỊNH NGHĨA CHÂN GPIO =====
#define PIN_DHT  D4   // DHT11
#define PIN_LDR  A0   // Cảm biến ánh sáng

#define DHT_TYPE DHT11

// ===== THAM SỐ =====
#define SENSOR_INTERVAL 5000  // 5 giây đọc 1 lần

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(PIN_DHT, DHT_TYPE);

unsigned long lastSensorRead = 0;

// ===== TRẠNG THÁI BẬT/TẮT CỦA 3 CẢM BIẾN =====
bool sensorTempOn = true;   // Cảm biến Nhiệt độ: BẬT
bool sensorHumOn = true;    // Cảm biến Độ ẩm: BẬT
bool sensorLightOn = true;  // Cảm biến Ánh sáng: BẬT

// ===== KẾT NỐI WI-FI =====
void connectWiFi() {
  Serial.print("📡 Đang kết nối Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Kết nối Wi-Fi thành công!");
    Serial.print("📡 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Không thể kết nối Wi-Fi!");
  }
}

// ===== KẾT NỐI MQTT =====
void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("📨 Đang kết nối MQTT...");
    String clientId = "ESP8266-" + String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" ✅");
      
      // Subscribe topic điều khiển
      if (mqttClient.subscribe(TOPIC_DEVICE_CONTROL)) {
        Serial.println("✅ Đã subscribe topic: " + String(TOPIC_DEVICE_CONTROL));
      }
      
      // Gửi trạng thái hiện tại
      publishDeviceStatus();
    } else {
      Serial.print(" ❌ (rc=");
      Serial.print(mqttClient.state());
      Serial.println(")");
      delay(5000);
    }
  }
}

// ===== XỬ LÝ LỆNH BẬT/TẮT CẢM BIẾN TỪ WEB =====
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("📩 Nhận lệnh: ");
  Serial.println(message);
  
  // Parse JSON đơn giản
  // {"device":"temp","action":"on"}   -> Bật cảm biến nhiệt độ
  // {"device":"hum","action":"off"}   -> Tắt cảm biến độ ẩm
  // {"device":"light","action":"on"}  -> Bật cảm biến ánh sáng
  
  bool isTemp = message.indexOf("\"device\":\"temp\"") != -1;
  bool isHum = message.indexOf("\"device\":\"hum\"") != -1;
  bool isLight = message.indexOf("\"device\":\"light\"") != -1;
  bool isOn = message.indexOf("\"action\":\"on\"") != -1;
  bool isOff = message.indexOf("\"action\":\"off\"") != -1;
  
  if (isTemp) {
    sensorTempOn = isOn;
    Serial.println(sensorTempOn ? "🌡️ Cảm biến Nhiệt độ: BẬT" : "🌡️ Cảm biến Nhiệt độ: TẮT");
  }
  
  if (isHum) {
    sensorHumOn = isOn;
    Serial.println(sensorHumOn ? "💧 Cảm biến Độ ẩm: BẬT" : "💧 Cảm biến Độ ẩm: TẮT");
  }
  
  if (isLight) {
    sensorLightOn = isOn;
    Serial.println(sensorLightOn ? "☀️ Cảm biến Ánh sáng: BẬT" : "☀️ Cảm biến Ánh sáng: TẮT");
  }
  
  // Gửi trạng thái mới lên MQTT
  publishDeviceStatus();
}

// ===== GỬI TRẠNG THÁI CỦA 3 CẢM BIẾN =====
void publishDeviceStatus() {
  String status = "{";
  status += "\"temp\":" + String(sensorTempOn ? "\"on\"" : "\"off\"") + ",";
  status += "\"hum\":" + String(sensorHumOn ? "\"on\"" : "\"off\"") + ",";
  status += "\"light\":" + String(sensorLightOn ? "\"on\"" : "\"off\"");
  status += "}";
  
  mqttClient.publish(TOPIC_DEVICE_STATUS, status.c_str());
  Serial.print("📤 Trạng thái cảm biến: ");
  Serial.println(status);
}

// ===== ĐỌC VÀ GỬI DỮ LIỆU CẢM BIẾN =====
void readAndPublishSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightRaw = analogRead(PIN_LDR);
  float lightLux = map(lightRaw, 0, 1023, 0, 1000);
  
  // ===== CHỈ GỬI DỮ LIỆU NẾU CẢM BIẾN ĐANG BẬT =====
  
  String jsonData = "{";
  bool hasData = false;
  
  // Chỉ thêm nhiệt độ nếu cảm biến đang BẬT
  if (sensorTempOn && !isnan(temperature)) {
    jsonData += "\"temp\":" + String(temperature, 1);
    hasData = true;
    Serial.println("🌡️ Nhiệt độ: " + String(temperature, 1) + " °C (Đang BẬT)");
  } else if (!sensorTempOn) {
    Serial.println("🌡️ Cảm biến Nhiệt độ: ĐANG TẮT - Không gửi dữ liệu");
  }
  
  // Chỉ thêm độ ẩm nếu cảm biến đang BẬT
  if (sensorHumOn && !isnan(humidity)) {
    if (hasData) jsonData += ",";
    jsonData += "\"hum\":" + String(humidity, 1);
    hasData = true;
    Serial.println("💧 Độ ẩm: " + String(humidity, 1) + " % (Đang BẬT)");
  } else if (!sensorHumOn) {
    Serial.println("💧 Cảm biến Độ ẩm: ĐANG TẮT - Không gửi dữ liệu");
  }
  
  // Chỉ thêm ánh sáng nếu cảm biến đang BẬT
  if (sensorLightOn) {
    if (hasData) jsonData += ",";
    jsonData += "\"light\":" + String(lightLux, 0);
    hasData = true;
    Serial.println("☀️ Ánh sáng: " + String(lightLux, 0) + " Lux (Đang BẬT)");
  } else {
    Serial.println("☀️ Cảm biến Ánh sáng: ĐANG TẮT - Không gửi dữ liệu");
  }
  
  jsonData += "}";
  
  // Chỉ gửi nếu có ít nhất 1 cảm biến đang BẬT
  if (hasData) {
    if (mqttClient.publish(TOPIC_SENSOR_DATA, jsonData.c_str())) {
      Serial.println("📤 Đã gửi dữ liệu: " + jsonData);
    } else {
      Serial.println("❌ Gửi dữ liệu thất bại!");
    }
  } else {
    Serial.println("⚠️ Tất cả cảm biến đều đang TẮT, không có dữ liệu để gửi!");
  }
  
  Serial.println("----------------------------------------");
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("🏠 Hestia SmartHome - Sensor Control");
  Serial.println("👨‍💻 Tác giả: Trần Mạnh Dũng - B23DCCN214");
  Serial.println("========================================\n");
  
  dht.begin();
  connectWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(callback);
  connectMQTT();
  
  Serial.println("✅ Hệ thống khởi tạo hoàn tất!");
  Serial.println("📌 Trạng thái ban đầu: Tất cả cảm biến đều BẬT");
  Serial.println("📌 Gửi lệnh bật/tắt qua topic: " + String(TOPIC_DEVICE_CONTROL));
  Serial.println();
}

// ===== LOOP =====
void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();
  
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = millis();
    readAndPublishSensorData();
  }
}