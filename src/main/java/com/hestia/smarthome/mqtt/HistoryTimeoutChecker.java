package com.hestia.smarthome.mqtt;

import com.hestia.smarthome.entity.History;
import com.hestia.smarthome.repository.HistoryRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Theo luồng UC02 đã mô tả: nếu Backend không nhận được phản hồi từ thiết bị (topic
 * "device/status") trong vòng 20 giây kể từ lúc gửi lệnh, bản ghi History tương ứng
 * phải được chuyển từ "Pending" sang "Error".
 *
 * Tác vụ này chạy định kỳ mỗi 5 giây để rà soát các bản ghi Pending đã quá 20 giây.
 */
@Component
public class HistoryTimeoutChecker {

    private static final long TIMEOUT_SECONDS = 20;

    private final HistoryRepository historyRepository;

    public HistoryTimeoutChecker(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Scheduled(fixedDelay = 5000)
    public void checkTimeouts() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);
        List<History> overdue = historyRepository.findByStatusAndPerformedAtBefore("Pending", threshold);

        for (History history : overdue) {
            history.setStatus("Error");
            historyRepository.save(history);
            System.out.println("Lệnh điều khiển thiết bị " + history.getDevice().getDeviceId()
                    + " đã timeout sau " + TIMEOUT_SECONDS + "s -> đánh dấu Error.");
        }
    }
}
