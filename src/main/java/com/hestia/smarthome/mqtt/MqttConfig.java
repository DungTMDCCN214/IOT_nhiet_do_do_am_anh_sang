package com.hestia.smarthome.mqtt;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

/**
 * Cấu hình kết nối MQTT Broker (Mosquitto) cho Backend.
 * - Kênh "inbound": lắng nghe dữ liệu cảm biến (sensor/data) và trạng thái thực thi (device/status)
 *   được publish lên từ ESP8266.
 * - Kênh "outbound": publish lệnh điều khiển (device/control) xuống ESP8266 khi người dùng
 *   bấm nút điều khiển thiết bị trên giao diện.
 */
@Configuration
public class MqttConfig {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id.in}")
    private String clientIdIn;

    @Value("${mqtt.client.id.out}")
    private String clientIdOut;

    @Value("${mqtt.topic.sensor}")
    private String sensorTopic;

    @Value("${mqtt.topic.control}")
    private String controlTopic;

    @Value("${mqtt.topic.status}")
    private String statusTopic;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(10);
        factory.setConnectionOptions(options);
        return factory;
    }

    // ---------- Kênh nhận dữ liệu (subscribe) ----------
    @Bean
    public MessageChannel mqttSensorInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel mqttDeviceStatusInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter inbound() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientIdIn + "-sensor", mqttClientFactory(), sensorTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttSensorInputChannel());
        return adapter;
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter inboundDeviceStatus() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientIdIn + "-status", mqttClientFactory(), statusTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttDeviceStatusInputChannel());
        return adapter;
    }

    // ---------- Kênh gửi lệnh điều khiển (publish) ----------
    @Bean
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttOutboundChannel")
    public MessageHandler mqttOutbound() {
        MqttPahoMessageHandler handler = new MqttPahoMessageHandler(clientIdOut, mqttClientFactory());
        handler.setAsync(true);
        handler.setDefaultQos(1);
        handler.setDefaultTopic(controlTopic);
        return handler;
    }
}
