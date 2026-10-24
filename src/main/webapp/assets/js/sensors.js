const SENSOR_META = {
  temperature: {
    label: "Nhiệt độ",
    icon: "ti-temperature",
    cls: "type-temp",
    unit: "°C",
  },
  humidity: { label: "Độ ẩm", icon: "ti-droplet", cls: "type-hum", unit: "%" },
  light: { label: "Ánh sáng", icon: "ti-sun", cls: "type-light", unit: "Lux" },
};

let state = {
  page: 0,
  limit: 10,
  criteria: "all",
  keyword: "",
  type: "",
  value: "",
  time: "",
};

function formatDateTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function loadStatusSummary() {
  fetch("/api/sensors/status-summary")
    .then((res) => res.json())
    .then((data) => {
      const el = document.getElementById("statusBadge");
      if (el) {
        el.innerHTML = `<span class="status-dot"></span> Hoạt động: ${data.active}/${data.total}`;
      }
    })
    .catch(() => {});
}

// GỬI THAM SỐ LÊN BACKEND LỌC DỮ LIỆU
function loadTable() {
  const params = new URLSearchParams({ page: state.page, limit: state.limit });

  // Nếu chọn "Tất cả" và có từ khóa -> Tìm tổng hợp qua keyword & value
  if (state.criteria === "all" && state.keyword) {
    params.set("keyword", state.keyword);
    params.set("value", state.keyword);
  } else {
    // Nếu chọn tiêu chí cụ thể -> Gửi các tham số riêng tích lũy
    if (state.type) params.set("type", state.type);
    if (state.value) params.set("value", state.value);
    if (state.time) params.set("time", state.time);
  }

  fetch(`/api/sensors/history?${params.toString()}`)
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("unauth");
      }
      if (!res.ok) {
        throw new Error(`request failed: ${res.status}`);
      }
      return res.json();
    })
    .then((result) => {
      renderTable(result.data);
      renderFooter(result.total, result.page);
    })
    .catch((err) => {
      console.error("loadTable error:", err);
      const tbody = document.getElementById("sensorTableBody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger); padding:24px;">Không thấy kết quả</td></tr>`;
      }
    });
}

// HÀM XỬ LÝ COPY
function copyToClipboard(text) {
  if (!text || text === "--") return;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      const toast = document.createElement("div");
      toast.textContent = `Đã sao chép: ${text}`;
      toast.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #10b981; color: white; padding: 8px 16px; border-radius: 6px;
      font-size: 13px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeInOut 2s ease forwards;
    `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    })
    .catch((err) => {
      console.error("Không thể sao chép: ", err);
    });
}

// HÀM RENDER BẢNG
function renderTable(rows) {
  const tbody = document.getElementById("sensorTableBody");
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding:24px;">Không tìm thấy dữ liệu</td></tr>`;
    return;
  }

  let html = "";
  rows.forEach((row, idx) => {
    const meta = SENSOR_META[row.sensor.sensorType] || {
      label: row.sensor.sensorType,
      icon: "ti-cpu",
      cls: "",
      unit: "",
    };
    const stt = state.page * state.limit + idx + 1;
    const timeStr = formatDateTime(row.recordedAt);

    // Dùng data-time để tránh lỗi cú pháp JS khi chuỗi có dấu nháy đơn
    html += `
      <tr>
        <td>${stt}</td>
        <td class="mono-code"># ${row.sensor.sensorCode}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${timeStr}</span>
            <button class="copy-btn" title="Sao chép thời gian" data-time="${timeStr}" onclick="copyToClipboard(this.getAttribute('data-time'))">
              <i class="ti ti-copy"></i>
            </button>
          </div>
        </td>
        <td class="${meta.cls}"><i class="ti ${meta.icon}"></i> ${meta.label}</td>
        <td class="${meta.cls}"><i class="ti ${meta.icon}"></i> ${row.value}${meta.unit}</td>
      </tr>`;
  });
  tbody.innerHTML = html;
}

function renderFooter(total, page) {
  const limit = state.limit;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : page * limit + 1;
  const to = Math.min(total, (page + 1) * limit);

  const infoEl = document.getElementById("resultInfo");
  if (infoEl) {
    infoEl.textContent = `Hiển thị ${from}-${to} của ${total} bản ghi`;
  }

  const pag = document.getElementById("pagination");
  if (!pag) return;
  pag.innerHTML = "";

  const addBtn = (label, targetPage, disabled, active) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (disabled) btn.disabled = true;
    if (active) btn.classList.add("active");
    btn.onclick = () => {
      state.page = targetPage;
      loadTable();
    };
    pag.appendChild(btn);
  };

  addBtn("<", Math.max(0, page - 1), page === 0, false);

  let start = Math.max(0, page - 2);
  let end = Math.min(totalPages - 1, start + 4);
  for (let p = start; p <= end; p++) addBtn(p + 1, p, false, p === page);

  addBtn(
    ">",
    Math.min(totalPages - 1, page + 1),
    page >= totalPages - 1,
    false,
  );
}

function handleCriteriaChange() {
  const criteriaSelect = document.getElementById("criteriaSelect");
  if (!criteriaSelect) return;
  const criteria = criteriaSelect.value;
  const container = document.getElementById("filterValueContainer");
  state.criteria = criteria;

  if (criteria === "all") {
    container.innerHTML = `
      <label>Từ khóa tìm kiếm</label>
      <input type="text" id="valueInput" value="${state.keyword}" placeholder="Nhập từ khóa (Loại, giá trị, thời gian)..." disabled/>
    `;
    const input = document.getElementById("valueInput");
    input.focus();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFiltersAndSearch();
      }
    });
  } else if (
    criteria === "temperature" ||
    criteria === "humidity" ||
    criteria === "light"
  ) {
    const meta = SENSOR_META[criteria];
    container.innerHTML = `
      <label>Nhập giá trị ${meta.label.toLowerCase()} (${meta.unit})</label>
      <input type="number" step="0.1" id="valueInput" value="${state.type === criteria ? state.value : ""}" placeholder="Nhập giá trị ${meta.label.toLowerCase()} (ví dụ: 30.5)..." />
    `;
    const input = document.getElementById("valueInput");
    input.focus();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFiltersAndSearch();
      }
    });
  } else if (criteria === "type") {
    container.innerHTML = `
      <label>Chọn loại cảm biến</label>
      <select id="typeSelect">
        <option value="">Tất cả loại</option>
        <option value="temperature" ${state.type === "temperature" ? "selected" : ""}>Nhiệt độ</option>
        <option value="humidity" ${state.type === "humidity" ? "selected" : ""}>Độ ẩm</option>
        <option value="light" ${state.type === "light" ? "selected" : ""}>Ánh sáng</option>
      </select>
    `;
    document.getElementById("typeSelect").addEventListener("change", (e) => {
      state.type = e.target.value;
      state.page = 0;
      loadTable();
    });
  } else if (criteria === "time") {
    container.innerHTML = `
      <label>Chọn mốc thời gian</label>
      <div class="datetime-input-wrap">
        <input type="text" id="timeFilter" value="${state.time}" placeholder="dd/MM/yyyy HH:mm">
        <button type="button" class="calendar-icon-btn" id="calendarBtn" title="Chọn thời gian">
          <i class="ti ti-calendar"></i>
        </button>
      </div>
      <div class="time-picker-panel" id="timePickerPanel">
        <div class="time-part-grid">
          <select id="yearPart"><option value="">Năm</option></select>
          <select id="monthPart"><option value="">Tháng</option></select>
          <select id="dayPart"><option value="">Ngày</option></select>
          <select id="hourPart"><option value="">Giờ</option></select>
          <select id="minutePart"><option value="">Phút</option></select>
          <select id="secondPart"><option value="">Giây</option></select>
        </div>
        <div class="time-picker-actions">
          <button type="button" class="search-btn" id="applyTimeBtn">Áp dụng</button>
        </div>
      </div>
    `;
    initTimePicker();
  }
}

function initTimePicker() {
  const calendarBtn = document.getElementById("calendarBtn");
  const timeFilter = document.getElementById("timeFilter");
  const panel = document.getElementById("timePickerPanel");
  if (!calendarBtn || !panel) return;

  const parts = [
    "yearPart",
    "monthPart",
    "dayPart",
    "hourPart",
    "minutePart",
    "secondPart",
  ].map((id) => document.getElementById(id));
  const addOptions = (select, max, start = 1) => {
    for (let i = start; i <= max; i++)
      select.add(new Option(String(i).padStart(2, "0"), i));
  };

  const now = new Date();
  for (let year = now.getFullYear() + 1; year >= 2020; year--)
    parts[0].add(new Option(year, year));
  addOptions(parts[1], 12);
  addOptions(parts[2], 31);
  addOptions(parts[3], 23, 0);
  addOptions(parts[4], 59, 0);
  addOptions(parts[5], 59, 0);

  calendarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });

  document.getElementById("applyTimeBtn")?.addEventListener("click", () => {
    const [year, month, day, hour, minute, second] = parts.map((part) => part.value);
    if (!year) {
      timeFilter.value = "";
    } else if (!month) {
      timeFilter.value = year;
    } else if (!day) {
      timeFilter.value = String(month).padStart(2, "0") + "/" + year;
    } else if (!hour) {
      timeFilter.value =
        String(day).padStart(2, "0") +
        "/" +
        String(month).padStart(2, "0") +
        "/" +
        year;
    } else if (!minute) {
      timeFilter.value =
        String(day).padStart(2, "0") +
        "/" +
        String(month).padStart(2, "0") +
        "/" +
        year +
        " " +
        String(hour).padStart(2, "0");
    } else if (!second) {
      timeFilter.value =
        String(day).padStart(2, "0") +
        "/" +
        String(month).padStart(2, "0") +
        "/" +
        year +
        " " +
        String(hour).padStart(2, "0") +
        ":" +
        String(minute).padStart(2, "0");
    } else {
      timeFilter.value =
        String(day).padStart(2, "0") + "/" + String(month).padStart(2, "0") + "/" + year +
        " " + String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0") +
        ":" + String(second).padStart(2, "0");
    }
    panel.classList.remove("open");
    state.time = timeFilter.value.trim();
    state.page = 0;
    loadTable();
  });
}

function applyFiltersAndSearch() {
  const criteria = state.criteria;

  if (criteria === "all") {
    state.keyword = (document.getElementById("valueInput")?.value || "").trim();
    state.type = "";
    state.value = "";
  } else if (
    criteria === "temperature" ||
    criteria === "humidity" ||
    criteria === "light"
  ) {
    state.type = criteria;
    state.value = (document.getElementById("valueInput")?.value || "").trim();
  } else if (criteria === "type") {
    state.type = document.getElementById("typeSelect")?.value || "";
    state.value = "";
  } else if (criteria === "time") {
    state.time = (document.getElementById("timeFilter")?.value || "").trim();
  }

  state.page = 0;
  loadTable();
}

// BẮT SỰ KIỆN GIAO DIỆN
document
  .getElementById("criteriaSelect")
  ?.addEventListener("change", handleCriteriaChange);

document
  .getElementById("searchBtn")
  ?.addEventListener("click", applyFiltersAndSearch);

document.getElementById("limitFilter")?.addEventListener("change", (e) => {
  state.limit = parseInt(e.target.value, 10);
  state.page = 0;
  loadTable();
});

// NÚT LÀM MỚI (RESET BỘ LỌC)
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  const button = document.getElementById("refreshBtn");
  if (button) {
    button.disabled = true;
    button.classList.add("is-loading");
  }

  state = {
    page: 0,
    limit: parseInt(document.getElementById("limitFilter")?.value || "10", 10),
    criteria: "all",
    keyword: "",
    type: "",
    value: "",
    time: "",
  };

  const criteriaSelect = document.getElementById("criteriaSelect");
  if (criteriaSelect) criteriaSelect.value = "all";
  handleCriteriaChange();

  loadTable();
  loadStatusSummary();

  window.setTimeout(() => {
    if (button) {
      button.disabled = false;
      button.classList.remove("is-loading");
    }
  }, 400);
});

// KHỞI TẠO TỰ ĐỘNG KHI LOAD TRANG
handleCriteriaChange();
loadStatusSummary();
loadTable();
