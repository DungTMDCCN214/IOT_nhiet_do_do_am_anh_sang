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

let state = { page: 0, limit: 10, type: "", keyword: "", range: "" };
let searchDebounce = null;

function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function loadStatusSummary() {
  fetch("/api/sensors/status-summary")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("statusBadge").innerHTML =
        `<span class="status-dot"></span> Hoạt động: ${data.active}/${data.total}`;
    });
}

function loadTable() {
  const params = new URLSearchParams({ page: state.page, limit: state.limit });
  if (state.type) params.set("type", state.type);
  if (state.keyword) params.set("keyword", state.keyword);
  if (state.range) params.set("range", state.range);

  fetch(`/api/sensors/history?${params.toString()}`)
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("unauth");
      }
      return res.json();
    })
    .then((result) => {
      renderTable(result.data);
      renderFooter(result.total, result.page);
    })
    .catch(() => {});
}

function renderTable(rows) {
  const tbody = document.getElementById("sensorTableBody");
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding:24px;">Không tìm thấy dữ liệu</td></tr>`;
    return;
  }

  rows.forEach((row, idx) => {
    const meta = SENSOR_META[row.sensor.sensorType] || {
      label: row.sensor.sensorType,
      icon: "ti-cpu",
      cls: "",
      unit: "",
    };
    const stt = state.page * state.limit + idx + 1;

    tbody.innerHTML += `
      <tr>
        <td>${stt}</td>
        <td class="mono-code"># ${row.sensor.sensorCode}</td>
        <td>${formatDateTime(row.recordedAt)}</td>
        <td>${meta.label}</td>
        <td class="${meta.cls}"><i class="ti ${meta.icon}"></i> ${row.value}${meta.unit}</td>
      </tr>`;
  });
}

function renderFooter(total, page) {
  const limit = state.limit;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : page * limit + 1;
  const to = Math.min(total, (page + 1) * limit);

  document.getElementById("resultInfo").textContent =
    `Hiển thị ${from}-${to} của ${total} bản ghi`;

  const pag = document.getElementById("pagination");
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

document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.keyword = e.target.value.trim();
    state.page = 0;
    loadTable();
  }, 400);
});

document.getElementById("typeFilter").addEventListener("change", (e) => {
  state.type = e.target.value;
  state.page = 0;
  loadTable();
});

document.getElementById("limitFilter").addEventListener("change", (e) => {
  state.limit = parseInt(e.target.value, 10);
  state.page = 0;
  loadTable();
});

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

document.getElementById("refreshBtn").addEventListener("click", () => {
  const button = document.getElementById("refreshBtn");
  button.disabled = true;
  button.classList.add("is-loading");

  state = { page: 0, limit: 10, type: "", keyword: "", range: "" };
  document.getElementById("searchInput").value = "";
  document.getElementById("typeFilter").value = "";
  document.getElementById("limitFilter").value = "10";
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

loadStatusSummary();
loadTable();
