let state = {
  page: 0,
  limit: 10,
  deviceId: "",
  action: "",
  status: "",
  time: "", // giá trị thời gian (YYYY-MM-DD HH:mm)
  range: "",
};

function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function deviceIcon(deviceName) {
  const name = (deviceName || "").toLowerCase();
  if (name.includes("nhiệt"))
    return { icon: "ti-temperature", cls: "type-temp" };
  if (name.includes("ẩm")) return { icon: "ti-droplet", cls: "type-hum" };
  if (name.includes("sáng") || name.includes("đèn"))
    return { icon: "ti-sun", cls: "type-light" };
  return { icon: "ti-plug", cls: "" };
}

function statusBadge(status) {
  if (status === "Success")
    return '<span class="badge-success">Thành công</span>';
  if (status === "Error") return '<span class="badge-danger">Thất bại</span>';
  return '<span class="badge-warning">Đang xử lý</span>';
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

function loadDeviceOptions() {
  fetch("/api/devices")
    .then((res) => res.json())
    .then((devices) => {
      const select = document.getElementById("deviceFilter");
      if (!select) return;
      const selectedDeviceId = select.value;
      select.innerHTML = '<option value="">Tất cả</option>';
      devices.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.deviceId;
        opt.textContent = `${d.deviceId} - ${d.deviceName}`;
        select.appendChild(opt);
      });
      select.value = selectedDeviceId;
    })
    .catch(() => {});
}

function loadTable() {
  const params = new URLSearchParams({ page: state.page, limit: state.limit });
  if (state.deviceId) params.set("deviceId", state.deviceId);
  if (state.action) params.set("action", state.action);
  if (state.status) params.set("status", state.status);
  if (state.time) params.set("time", state.time);
  if (state.range) params.set("range", state.range);

  fetch(`/api/devices/history?${params.toString()}`)
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
      const tbody = document.getElementById("historyTableBody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:24px;">Không tải được lịch sử thiết bị. Vui lòng kiểm tra Backend.</td></tr>`;
      }
    });
}

function renderTable(rows) {
  const tbody = document.getElementById("historyTableBody");
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-secondary); padding:24px;">Không có dữ liệu lịch sử</td></tr>`;
    return;
  }

  // Build string 1 lần thay vì innerHTML += trong vòng lặp
  let html = "";
  rows.forEach((row, idx) => {
    const meta = deviceIcon(row.device.deviceName);
    const stt = state.page * state.limit + idx + 1;

    html += `
      <tr>
        <td>${stt}</td>
        <td class="mono-code"># ${row.device.deviceId}</td>
        <td>${formatDateTime(row.performedAt)}</td>
        <td class="${meta.cls}"><i class="ti ${meta.icon}"></i> ${row.device.deviceName}</td>
        <td>${row.action}</td>
        <td>${row.user ? row.user.fullName : "--"}</td>
        <td>${statusBadge(row.status)}</td>
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
  // ĐÃ BỎ: đọc #searchInput (vì JSP không còn ô này)
  state.deviceId = document.getElementById("deviceFilter")?.value || "";
  state.action = document.getElementById("actionFilter")?.value || "";
  state.status = document.getElementById("statusFilter")?.value || "";
  state.limit = parseInt(
    document.getElementById("limitFilter")?.value || "10",
    10,
  );
  state.time = (document.getElementById("timeFilter")?.value || "").trim();
  state.page = 0;
  loadTable();
}

// Nút Tìm kiếm
document
  .getElementById("searchBtn")
  ?.addEventListener("click", applyFiltersAndSearch);

// Enter trong ô thời gian cũng kích hoạt tìm kiếm
document.getElementById("timeFilter")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyFiltersAndSearch();
  }
});

// Nút Làm mới
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  const button = document.getElementById("refreshBtn");
  button.disabled = true;
  button.classList.add("is-loading");

  state = {
    page: 0,
    limit: 10,
    deviceId: "",
    action: "",
    status: "",
    time: "",
    range: "",
  };

  // Reset các ô filter (đã bỏ #searchInput)
  const deviceFilter = document.getElementById("deviceFilter");
  if (deviceFilter) deviceFilter.value = "";
  const actionFilter = document.getElementById("actionFilter");
  if (actionFilter) actionFilter.value = "";
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) statusFilter.value = "";
  const limitFilter = document.getElementById("limitFilter");
  if (limitFilter) limitFilter.value = "10";
  const timeFilter = document.getElementById("timeFilter");
  if (timeFilter) timeFilter.value = "";
  const timePicker = document.getElementById("timeFilterPicker");
  if (timePicker) timePicker.value = "";

  // Bỏ active các nút range nếu có
  document
    .querySelectorAll("#rangeButtons button")
    .forEach((rangeButton) => rangeButton.classList.remove("active"));

  loadTable();
  loadStatusSummary();
  window.setTimeout(() => {
    button.disabled = false;
    button.classList.remove("is-loading");
  }, 500);
});

// Range buttons (nếu có trong DOM — hiện tại JSP không có, guard để an toàn)
document.querySelectorAll("#rangeButtons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("#rangeButtons button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.range = btn.dataset.range;
  });
});

// Khởi động
loadStatusSummary();
loadDeviceOptions();
loadTable();
