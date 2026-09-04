import paho.mqtt.client as mqtt
import json
import random
import time
import threading

# Trạng thái bật/tắt của 3 cảm biến
sensor_states = {
    "temp": True,
    "hum": True,
    "light": True
}

# Hàm xử lý lệnh nhận được
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        device = payload.get("device")
        action = payload.get("action")
        
        if device == "all":
            for key in sensor_states:
                sensor_states[key] = (action == "on")
            print(f"\n🔄 {('BẬT' if action == 'on' else 'TẮT')} TẤT CẢ cảm biến")
        elif device in sensor_states:
            sensor_states[device] = (action == "on")
            print(f"\n✅ Cảm biến {device}: {('BẬT' if action == 'on' else 'TẮT')}")
    except:
        pass

# Kết nối MQTT
client = mqtt.Client()
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.subscribe("device_control")
client.loop_start()

print("========================================")
print("🏠 ESP8266 Simulator - Hestia SmartHome")
print("========================================\n")
print("📌 Trạng thái ban đầu: Tất cả cảm biến BẬT")
print("📌 Đang gửi dữ liệu lên MQTT...\n")

# Vòng lặp gửi dữ liệu
while True:
    data = {}
    
    if sensor_states["temp"]:
        data["temp"] = random.randint(20, 35)
    if sensor_states["hum"]:
        data["hum"] = random.randint(60, 90)
    if sensor_states["light"]:
        data["light"] = random.randint(500, 1500)
    
    if data:
        json_data = json.dumps(data)
        print(f"📤 Gửi: {json_data}")
        client.publish("sensor_data", json_data)
    else:
        print("⚠️ Tất cả cảm biến đều TẮT, không gửi dữ liệu!")
    
    time.sleep(2)