package com.hestia.smarthome.mqtt;

import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.handler.annotation.Header;

/**
 * Gateway cho phép gọi mqttGateway.publish(topic, payload) ở bất kỳ đâu trong code
 * mà không cần thao tác trực tiếp với MessageChannel.
 */
@MessagingGateway(defaultRequestChannel = "mqttOutboundChannel")
public interface MqttGateway {
    void publish(@Header(MqttHeaders.TOPIC) String topic, String payload);
}
