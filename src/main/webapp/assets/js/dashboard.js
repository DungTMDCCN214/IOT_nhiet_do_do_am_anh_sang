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
let yAxisChartInstance = null;
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

// ================== RENDER BIỂU ĐỒ (TRỤC Y CỐ ĐỊNH CHUẨN ĐỘI CHIA + TRƯỢT NGANG TRỤC X) ==================
function renderChart(data) {
  const byType = { temperature: [], humidity: [], light: [] };
  let maxYValue = 200; // Giá trị tối đa mặc định của trục Y

  data.forEach((d) => {
    const type = d.sensor && d.sensor.sensorType;
    if (byType[type]) {
      byType[type].push({ x: d.recordedAt, y: d.value });
      if (d.value > maxYValue) {
        maxYValue = Math.ceil(d.value / 50) * 50; // Làm tròn theo bội số 50
      }
    }
  });

  // 1. TÍNH TOÁN CHIỀU RỘNG BẢNG TRƯỢT NGANG
  const maxPoints = Math.max(
    byType.temperature.length,
    byType.humidity.length,
    byType.light.length,
  );

  const scrollContainer = document.getElementById("chartScrollContainer");
  const scrollWrapper = document.getElementById("chartScrollWrapper");

  if (scrollContainer && scrollWrapper) {
    const containerWidth = scrollContainer.clientWidth;
    const pixelsPerPoint = 35; // Khoảng cách cố định 35px cho mỗi mốc điểm dữ liệu
    const calculatedWidth = maxPoints * pixelsPerPoint;
    const newWidth = Math.max(containerWidth, calculatedWidth);
    scrollWrapper.style.width = `${newWidth}px`;
  }

  // 2. VẼ TRỤC Y CỐ ĐỊNH BÊN TRÁI
  const yCtx = document.getElementById("yAxisChart");
  if (yCtx) {
    if (yAxisChartInstance) yAxisChartInstance.destroy();
    yAxisChartInstance = new Chart(yCtx, {
      type: "line",
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 28,
            top: 32,
            right: 6,
          },
        },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: {
            min: 0,
            max: maxYValue,
            ticks: {
              font: { size: 10 },
              color: "#6b7280",
              stepSize: 50, // Chia đều nấc 50 đơn vị (0, 50, 100, 150, 200)
              precision: 0,
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  // 3. VẼ ĐỒ THỊ ĐƯỜNG BÊN PHẢI (ẨN TRỤC Y CHÍNH)
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
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Độ ẩm (%)",
          data: byType.humidity,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,0.08)",
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Ánh sáng (Lux)",
          data: byType.light,
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.08)",
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          time: {
            unit: "minute",
            displayFormats: { minute: "HH:mm" },
            tooltipFormat: "HH:mm:ss dd/MM",
          },
          ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: false },
          grid: { color: "rgba(0,0,0,0.03)" },
        },
        y: {
          min: 0,
          max: maxYValue,
          display: false, // Ẩn trục Y chính vì đã có trục Y cố định bên trái
        },
      },
    },
  });

  // 4. TỰ ĐỘNG CUỘN VỀ BÊN PHẢI CÙNG ĐỂ THEO DÕI DỮ LIỆU REALTIME MỚI NHẤT
  if (scrollContainer) {
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
  }
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
        <label class="toggle-switch ${pending ? "is-loading" : ""}" style="flex-shrink:0;">
          <input type="checkbox" ${checked} ${pending ? "disabled" : ""} onchange="controlDevice('${device.deviceId}', this)">
          <span class="toggle-track"></span>
        </label>
      </div>`;
  });
}

// ================== ĐIỀU KHIỂN THIẾT BỊ ==================
function controlDevice(deviceId, checkbox) {
  const turnOn = checkbox.checked;

  // 1. Giữ nguyên trạng thái người dùng vừa gạt để thấy phản hồi trực quan
  // (Không đảo ngược checkbox.checked = !turnOn như code cũ)

  // 2. Thêm hiệu ứng xoay tròn và vô hiệu hóa nút bấm tạm thời
  const toggleSwitch = checkbox.closest(".toggle-switch");
  if (toggleSwitch) {
    toggleSwitch.classList.add("is-loading");
  }
  checkbox.disabled = true;

  // 3. Gửi yêu cầu API xuống hệ thống
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
    .then(() => {
      // Đợi phản hồi hoàn tất từ phần cứng/MQTT thông qua WebSocket đẩy về hoặc gọi lại loadDevices
      setTimeout(loadDevices, 1000);
    })
    .catch(() => {
      // Nếu lỗi mạng: Gỡ loading, mở khóa và TRẢ LẠI trạng thái ban đầu (đảo ngược lại)
      if (toggleSwitch) toggleSwitch.classList.remove("is-loading");
      checkbox.disabled = false;
      checkbox.checked = !turnOn;
    });
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
