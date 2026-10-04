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
  type: "",
  value: "",
  time: "",
  range: "",
};

function formatDateTime(iso) {
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

function loadTable() {
  const params = new URLSearchParams({ page: state.page, limit: state.limit });
  if (state.type) params.set("type", state.type);

  // Gửi keyword = giá trị người dùng nhập vào ô "Giá trị"
  // (backend cũ đọc keyword, nên filter vẫn hoạt động)
  if (state.value) params.set("value", state.value);

  if (state.range) params.set("range", state.range);

  // KHÔNG gửi "time" lên API để tránh 400 nếu backend chưa hỗ trợ.
  // Khi nào backend nhận "time", bỏ comment dòng dưới:
  if (state.time) params.set("time", state.time);

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

    html += `
      <tr>
        <td>${stt}</td>
        <td class="mono-code"># ${row.sensor.sensorCode}</td>
        <td>${formatDateTime(row.recordedAt)}</td>
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

function applyFiltersAndSearch() {
  state.type = document.getElementById("typeFilter")?.value || "";
  state.value = (document.getElementById("valueFilter")?.value || "").trim();
  state.limit = parseInt(
    document.getElementById("limitFilter")?.value || "10",
    10,
  );
  state.time = (document.getElementById("timeFilter")?.value || "").trim();
  state.page = 0;
  loadTable();
}

// Nút Tìm
document
  .getElementById("searchBtn")
  ?.addEventListener("click", applyFiltersAndSearch);

// Enter trong ô Giá trị
document.getElementById("valueFilter")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyFiltersAndSearch();
  }
});

// Enter trong ô Thời gian
document.getElementById("timeFilter")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyFiltersAndSearch();
  }
});

// Đổi Loại cảm biến thì load ngay
document.getElementById("typeFilter")?.addEventListener("change", (e) => {
  state.type = e.target.value;
  state.page = 0;
  loadTable();
});

// Đổi Số bản ghi thì load ngay
document.getElementById("limitFilter")?.addEventListener("change", (e) => {
  state.limit = parseInt(e.target.value, 10);
  state.page = 0;
  loadTable();
});

// Nút Làm mới
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  const button = document.getElementById("refreshBtn");
  button.disabled = true;
  button.classList.add("is-loading");

  state = { page: 0, limit: 10, type: "", value: "", time: "", range: "" };

  const typeFilter = document.getElementById("typeFilter");
  if (typeFilter) typeFilter.value = "";
  const valueFilter = document.getElementById("valueFilter");
  if (valueFilter) valueFilter.value = "";
  const limitFilter = document.getElementById("limitFilter");
  if (limitFilter) limitFilter.value = "10";
  const timeFilter = document.getElementById("timeFilter");
  if (timeFilter) timeFilter.value = "";
  const timePicker = document.getElementById("timeFilterPicker");
  if (timePicker) timePicker.value = "";

  loadTable();
  loadStatusSummary();
  window.setTimeout(() => {
    button.disabled = false;
    button.classList.remove("is-loading");
  }, 500);
});

// Range buttons (guard an toàn, JSP hiện không có)
document.querySelectorAll("#rangeButtons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("#rangeButtons button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.range = btn.dataset.range;
    state.page = 0;
    loadTable();
  });
});

loadStatusSummary();
loadTable();
