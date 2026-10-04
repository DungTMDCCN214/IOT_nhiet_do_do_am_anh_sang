// ================== CẤU HÌNH KHOẢNG TỐI ƯU ==================
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

// ================== RENDER 3 THẺ CẢM BIẾN ==================
function renderSensorCards(data) {
  const container = document.getElementById("sensorCards");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(OPTIMAL_RANGES).forEach((type) => {
    const info = OPTIMAL_RANGES[type];
    const record = data.find((d) => d.sensor && d.sensor.sensorType === type);
    const value = record ? record.value : "--";

    container.innerHTML += `
      <div class="card" style="overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-size:13px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${info.label}
            </div>
            <div style="font-size:24px; font-weight:700; margin-top:4px; line-height:1.2;">
              ${value} <span style="font-size:14px; font-weight:500;">${info.unit}</span>
            </div>
          </div>
          <div style="width:34px;height:34px;flex-shrink:0;background:var(--primary-light);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <i class="ti ${info.icon}" style="color:var(--primary);"></i>
          </div>
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          <span class="status-dot" style="background:var(--primary); display:inline-block;"></span> ${info.text}
        </div>
      </div>`;
  });
}

// ================== RENDER BIỂU ĐỒ ==================
function renderChart(data) {
  const byType = { temperature: [], humidity: [], light: [] };
  data.forEach((d) => {
    const type = d.sensor && d.sensor.sensorType;
    if (byType[type]) {
      byType[type].push({ x: d.recordedAt, y: d.value });
    }
  });

  const ctx = document.getElementById("sensorChart");
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Nhiệt độ (°C)",
          data: byType.temperature,
          borderColor: "#DC2626",
          backgroundColor: "rgba(220,38,38,0.08)",
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: "Độ ẩm (%)",
          data: byType.humidity,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,0.08)",
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: "Ánh sáng (Lux)",
          data: byType.light,
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.08)",
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // QUAN TRỌNG: cho phép co giãn theo container
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { unit: "hour", tooltipFormat: "HH:mm dd/MM" },
          ticks: { font: { size: 10 }, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          ticks: { font: { size: 10 } },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    },
  });
}

// ================== RENDER DANH SÁCH THIẾT BỊ ==================
function renderDeviceList(devices) {
  const container = document.getElementById("deviceList");
  if (!container) return;

  if (!devices || devices.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--text-secondary); padding:12px 0;">Chưa có thiết bị nào.</div>`;
    return;
  }

  container.innerHTML = "";
  devices.forEach((device) => {
    const checked = device.currentStatus === "ON" ? "checked" : "";
    const pending = device.currentStatus === "PENDING";
    container.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
        <div style="min-width:0; padding-right:8px;">
          <div style="font-weight:500; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${device.deviceName}
          </div>
          <div style="font-size:11px; color:var(--text-secondary);">
            Status: ${device.currentStatus}
          </div>
        </div>
        <label class="toggle-switch" style="flex-shrink:0;">
          <input type="checkbox" ${checked} ${pending ? "disabled" : ""} onchange="controlDevice('${device.deviceId}', this.checked)">
          <span class="toggle-track"></span>
        </label>
      </div>`;
  });
}

// ================== ĐIỀU KHIỂN THIẾT BỊ ==================
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
    .then(() => setTimeout(loadDevices, 1000));
}

// ================== LOAD DỮ LIỆU ==================
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

// ================== WEBSOCKET REALTIME ==================
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

  stompClient.connect(
    {},
    () => {
      stompClient.subscribe("/topic/sensors", refreshRealtimeSensorData);
      stompClient.subscribe("/topic/devices", loadDevices);
    },
    () => {
      setTimeout(connectSensorWebSocket, 5000);
    },
  );
}

// ================== KHỞI ĐỘNG ==================
loadSensorData();
loadChartData();
loadDevices();
connectSensorWebSocket();

setInterval(() => {
  loadSensorData();
  loadDevices();
}, 5000);
