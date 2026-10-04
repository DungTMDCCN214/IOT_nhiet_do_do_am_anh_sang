package com.hestia.smarthome.repository;

import com.hestia.smarthome.entity.DataSensor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DataSensorRepository extends JpaRepository<DataSensor, Long> {

    // Lấy bản ghi mới nhất của mỗi loại cảm biến -> phục vụ UC01 (Dashboard realtime)
    @Query("SELECT d FROM DataSensor d WHERE d.recordedAt = (" +
           "   SELECT MAX(d2.recordedAt) FROM DataSensor d2 WHERE d2.sensor = d.sensor" +
           ") AND (:type IS NULL OR d.sensor.sensorType = :type)")
    List<DataSensor> findLatestPerType(@Param("type") String type);

    // Tra cứu lịch sử dữ liệu cảm biến có lọc theo loại/từ khóa/khoảng thời gian -> UC03
    @Query("SELECT d FROM DataSensor d WHERE " +
           "(:type IS NULL OR d.sensor.sensorType = :type) AND " +
           "(:value IS NULL OR d.value = :value) AND " +
           "(:from IS NULL OR d.recordedAt >= :from) AND " +
           "(:to IS NULL OR d.recordedAt < :to)")
    Page<DataSensor> search(@Param("type") String type,
                             @Param("value") Double value,
                             @Param("from") LocalDateTime from,
                             @Param("to") LocalDateTime to,
                             Pageable pageable);

    // Dữ liệu tổng hợp cho biểu đồ 12 giờ gần nhất -> UC05
    @Query("SELECT d FROM DataSensor d WHERE d.recordedAt >= :from ORDER BY d.recordedAt ASC")
    List<DataSensor> findForChart(@Param("from") LocalDateTime from);
}
