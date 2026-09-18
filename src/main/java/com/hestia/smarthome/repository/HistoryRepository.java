package com.hestia.smarthome.repository;

import com.hestia.smarthome.entity.History;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends JpaRepository<History, Long> {

    // Tra cứu lịch sử điều khiển thiết bị có lọc -> UC04
    // Tìm bản ghi Pending gần nhất của một thiết bị -> dùng khi nhận phản hồi MQTT (device/status)
    Optional<History> findTopByDevice_DeviceIdAndStatusOrderByPerformedAtDesc(String deviceId, String status);

    // Tìm tất cả bản ghi Pending quá hạn -> dùng cho tác vụ kiểm tra timeout 20s
    List<History> findByStatusAndPerformedAtBefore(String status, LocalDateTime before);
    @Query("SELECT h FROM History h WHERE " +
        "(:deviceId IS NULL OR h.device.deviceId = :deviceId) AND " +
        "(:keyword IS NULL OR h.device.deviceId LIKE CONCAT('%', :keyword, '%') " +
        "  OR h.device.deviceName LIKE CONCAT('%', :keyword, '%')) AND " +
        "(:action IS NULL OR h.action = :action) AND " +
        "(:status IS NULL OR h.status = :status) AND " +
        "(:from IS NULL OR h.performedAt >= :from)")
    Page<History> search(@Param("deviceId") String deviceId,
                        @Param("keyword") String keyword,
                        @Param("action") String action,
                        @Param("status") String status,
                        @Param("from") LocalDateTime from,
                        Pageable pageable);
}
