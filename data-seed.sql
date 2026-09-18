-- Run after Spring Boot creates the tables for the first time.
-- Device IDs match the three physical LED identifiers used by the firmware.

INSERT INTO Sensors (sensor_code, sensor_type, unit, status) VALUES
  ('CB-TEMP-01', 'temperature', 'C', 'ON'),
  ('CB-HUM-01', 'humidity', '%', 'ON'),
  ('CB-LIGHT-01', 'light', 'Lux', 'ON')
ON DUPLICATE KEY UPDATE
  sensor_type = VALUES(sensor_type),
  unit = VALUES(unit),
  status = VALUES(status);

-- RED = LED 1, GREEN = LED 2, YELLOW = LED 3.
-- History.device_id references these exact values.
INSERT INTO Devices (device_id, device_name, current_status, created_at) VALUES
  ('RED', 'Den Do', 'OFF', NOW()),
  ('GREEN', 'Den Xanh', 'OFF', NOW()),
  ('YELLOW', 'Den Vang', 'OFF', NOW())
ON DUPLICATE KEY UPDATE
  device_name = VALUES(device_name),
  current_status = VALUES(current_status);

INSERT INTO Users (student_code, full_name, username, password, role, school, created_at)
SELECT 'B23DCCN214', 'Tran Manh Dung', 'manhdung2509@gmail.com', '123456', 'Sinh vien',
       'Hoc vien Cong nghe Buu chinh Vien thong', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM Users WHERE username = 'manhdung2509@gmail.com'
);
