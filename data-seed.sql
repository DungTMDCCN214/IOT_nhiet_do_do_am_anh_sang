-- Chạy sau khi backend đã tự tạo bảng lần đầu (spring.jpa.hibernate.ddl-auto=update)
-- để có sẵn dữ liệu test cho các API.

INSERT INTO Sensors (sensor_code, sensor_type, unit, status) VALUES
  ('CB-TEMP-01', 'temperature', '°C', 'ON'),
  ('CB-HUM-01',  'humidity',    '%',  'ON'),
  ('CB-LIGHT-01','light',       'Lux','ON');

INSERT INTO Devices (device_id, device_name, current_status, created_at) VALUES
  ('DV-001', 'Đèn phòng khách', 'OFF', NOW()),
  ('DV-002', 'Quạt phòng khách', 'OFF', NOW());

INSERT INTO Users (student_code, full_name, username, password, role, school, created_at) VALUES
  ('B23DCCN214', 'Trần Mạnh Dũng', 'manhdung2509@gmail.com', '123456', 'Sinh viên',
   'Học viện Công nghệ Bưu chính Viễn thông', NOW());
