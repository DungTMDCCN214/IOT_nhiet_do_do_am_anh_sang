package com.hestia.smarthome;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // cần cho tác vụ kiểm tra timeout lệnh điều khiển (xem HistoryTimeoutChecker)
public class HestiaSmarthomeApplication {
    public static void main(String[] args) {
        SpringApplication.run(HestiaSmarthomeApplication.class, args);
    }
}
