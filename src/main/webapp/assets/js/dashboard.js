// Khoảng giá trị tối ưu (Figma) — chưa có cột riêng trong DB nên tạm khai báo cứng ở đây
const OPTIMAL_RANGES = {
  temperature: {
    label: "Nhiệt độ",
    unit: "°C",
    icon: "ti-temperature",
    text: "Optimal: 22-26 °C",
  },
  light: {
    label: "Ánh sáng",
    unit: "Lux",
    icon: "ti-sun",
    text: "Optimal: 500-1000 Lux",
  },
  humidity: {
    label: "Độ ẩm",
    unit: "%",
    icon: "ti-droplet",
    text: "Optimal: 40-60 %",
  },
};

let chartInstance = null;
let realtimeRefreshTimer = null;

function renderSensorCards(data) {
  const container = document.getElementById("sensorCards");
  container.innerHTML = "";

  Object.keys(OPTIMAL_RANGES).forEach((type) => {
    const info = OPTIMAL_RANGES[type];
    const record = data.find((d) => d.sensor.sensorType === type);
    const value = record ? record.value : "--";

    container.innerHTML += `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:13px; color:var(--text-secondary);">${info.label}</div>
            <div style="font-size:26px; font-weight:700; margin-top:6px;">${value} ${info.unit}</div>
          </div>
          <div style="width:36px;height:36px;background:var(--primary-light);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <i class="ti ${info.icon}" style="color:var(--primary);"></i>
          </div>
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:10px;">
          <span class="status-dot" style="background:var(--primary); display:inline-block;"></span> ${info.text}
        </div>
      </div>`;
  });
}

function renderChart(data) {
  const byType = { temperature: [], humidity: [], light: [] };
  data.forEach((d) => {
    const type = d.sensor.sensorType;
    if (byType[type]) {
      byType[type].push({ x: d.recordedAt, y: d.value });
    }
  });

  const ctx = document.getElementById("sensorChart");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Nhiệt độ (°C)",
          data: byType.temperature,
          borderColor: "#DC2626",
          tension: 0.3,
        },
        {
          label: "Độ ẩm (%)",
          data: byType.humidity,
          borderColor: "#2563EB",
          tension: 0.3,
        },
        {
          label: "Ánh sáng (Lux)",
          data: byType.light,
          borderColor: "#F59E0B",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { x: { type: "time", time: { unit: "hour" } } },
    },
  });
}

function renderDeviceList(devices) {
  const container = document.getElementById("deviceList");
  container.innerHTML = "";

  devices.forEach((device) => {
    const checked = device.currentStatus === "ON" ? "checked" : "";
    const pending = device.currentStatus === "PENDING";
    container.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
        <div>
          <div style="font-weight:500;">${device.deviceName}</div>
          <div style="font-size:12px; color:var(--text-secondary);">Status: ${device.currentStatus}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${checked} ${pending ? "disabled" : ""} onchange="controlDevice('${device.deviceId}', this.checked)">
          <span class="toggle-track"></span>
        </label>
      </div>`;
  });
}

function controlDevice(deviceId, turnOn) {
  fetch(`/api/devices/${deviceId}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: turnOn ? "ON" : "OFF" }),
  })
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      return res.json();
    })
    .then(() => setTimeout(loadDevices, 1000)); // chờ 1s rồi làm mới lại trạng thái thật
}

function loadSensorData() {
  fetch("/api/sensors")
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("unauth");
      }
      return res.json();
    })
    .then(renderSensorCards)
    .catch(() => {});
}

function loadChartData() {
  fetch("/api/sensors/chart")
    .then((res) => res.json())
    .then(renderChart)
    .catch(() => {});
}

function loadDevices() {
  fetch("/api/devices")
    .then((res) => res.json())
    .then(renderDeviceList)
    .catch(() => {});
}

function refreshRealtimeSensorData() {
  clearTimeout(realtimeRefreshTimer);
  realtimeRefreshTimer = setTimeout(() => {
    loadSensorData();
    loadChartData();
  }, 150);
}

function connectSensorWebSocket() {
  const socket = new SockJS("/ws");
  const stompClient = Stomp.over(socket);
  stompClient.debug = null;

  stompClient.connect({}, () => {
    stompClient.subscribe("/topic/sensors", refreshRealtimeSensorData);
    stompClient.subscribe("/topic/devices", loadDevices);
  }, () => {
    setTimeout(connectSensorWebSocket, 5000);
  });
}

// Load lần đầu
loadSensorData();
loadChartData();
loadDevices();
connectSensorWebSocket();

// Làm mới định kỳ mỗi 5 giây — đúng luồng UC01/UC05 đã mô tả
setInterval(() => {
  loadSensorData();
  loadDevices();
}, 5000);
