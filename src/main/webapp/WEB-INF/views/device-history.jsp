<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Lịch sử thiết bị - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <style>
    /* ================= BỐ CỤC 1 TRANG DUY NHẤT ================= */
    html, body {
      height: 100%;
      margin: 0;
      overflow: hidden;
    }
    .app-layout {
      height: 100vh;
      display: flex;
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      padding: 20px 24px;
      box-sizing: border-box;
      gap: 16px;
    }
    .page-header {
      flex-shrink: 0;
      margin-bottom: 0;
    }

    .card {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    /* ===== FILTER BAR: 1 HÀNG NGANG, CÁC Ô TỰ CO GIÃN ===== */
    .filter-bar {
      flex-shrink: 0;
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      align-items: flex-end;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border, #e5e7eb);
      overflow: visible;
    }

    .filter-group {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1 1 0;
      min-width: 0;
    }
    /* Ô "Thiết bị" rộng hơn một chút vì hiển thị tên dài */
    .filter-group.device-group {
      flex: 1.6 1 0;
    }

    .filter-group label {
      font-size: 12px;
      color: var(--text-secondary, #6b7280);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ===== STYLE CHUNG CHO INPUT / SELECT ===== */
    .filter-group input[type="text"],
    .filter-group select {
      width: 100%;
      min-width: 0;
      height: 34px;
      box-sizing: border-box;
      font-size: 13px;
      padding: 0 10px;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 8px;
      background: #fff;
      color: #111827;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .filter-group input[type="text"]:focus,
    .filter-group select:focus {
      border-color: var(--primary, #2563eb);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    /* SELECT: bỏ style mặc định, thêm mũi tên custom */
    .filter-group select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      padding-right: 28px;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 14px;
      cursor: pointer;
    }

    /* Ô thời gian: bo viền giống các ô khác */
    .datetime-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
      height: 34px;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 8px;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .datetime-input-wrap:focus-within {
      border-color: var(--primary, #2563eb);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    .datetime-input-wrap input[type="text"] {
      flex: 1;
      min-width: 0;
      height: 100%;
      border: none;
      border-radius: 8px;
      padding: 0 40px 0 10px;
      background: transparent;
      outline: none;
      font-size: 13px;
    }
    .datetime-input-wrap .calendar-icon-btn {
      position: absolute;
      right: 0;
      top: 0;
      width: 34px;
      height: 100%;
      background: #f8fafc;
      border: 0;
      border-left: 1px solid var(--border, #d1d5db);
      border-radius: 0 7px 7px 0;
      cursor: pointer;
      color: #6b7280;
      font-size: 17px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }
    .datetime-input-wrap .calendar-icon-btn:hover {
      color: #fff;
      background: var(--primary, #2563eb);
    }
    .datetime-input-wrap input[type="datetime-local"] {
      position: absolute;
      right: 4px;
      width: 26px;
      height: 26px;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }
    .time-picker-panel { display:none; position:absolute; right:0; top:calc(100% + 6px); z-index:10; width:250px; padding:10px; border:1px solid var(--border, #d1d5db); border-radius:8px; background:#fff; box-shadow:0 8px 20px rgba(0,0,0,.14); }
    .time-picker-panel.open { display:block; }
    .time-part-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .time-part-grid select { height:32px; min-width:0; }
    .time-picker-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }

    /* Nút Tìm + Làm mới */
    .filter-bar .search-btn {
      flex: 0 0 auto;
      height: 34px;
      align-self: flex-end;
      white-space: nowrap;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .filter-bar .icon-btn {
      flex: 0 0 auto;
      height: 34px;
      width: 34px;
      align-self: flex-end;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid var(--border, #d1d5db);
      background: #fff;
      color: #374151;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .filter-bar .icon-btn:hover {
      background: #f3f4f6;
      color: var(--primary, #2563eb);
      border-color: var(--primary, #2563eb);
    }
    .filter-bar .icon-btn.is-loading i {
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ===== VÙNG BẢNG TỰ CUỘN ===== */
    .table-scroll {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      margin-top: 4px;
    }
    .table-scroll table {
      width: 100%;
      border-collapse: collapse;
    }
    .table-scroll thead th {
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 1;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border, #e5e7eb);
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
    }
    .table-scroll tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border, #e5e7eb);
      font-size: 13px;
    }

    /* ===== FOOTER CỐ ĐỊNH ===== */
    .table-footer {
      flex-shrink: 0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pagination {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .pagination button {
      min-width: 32px;
      height: 32px;
      border: 1px solid var(--border, #e5e7eb);
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .pagination button.active {
      background: var(--primary, #2563eb);
      color: #fff;
      border-color: var(--primary, #2563eb);
    }
    .pagination button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* ===== CSS FALLBACK CHO BADGE/ICON ===== */
    .badge-success { background:#dcfce7; color:#166534; padding:2px 8px; border-radius:6px; font-size:12px; white-space:nowrap; }
    .badge-danger  { background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:6px; font-size:12px; white-space:nowrap; }
    .badge-warning { background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:6px; font-size:12px; white-space:nowrap; }

    .type-temp  { color:#DC2626; }
    .type-hum   { color:#2563EB; }
    .type-light { color:#F59E0B; }

    .mono-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color:#6b7280; }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-content { padding: 12px 16px; gap: 12px; }
      .filter-bar { gap: 6px; }
      .filter-group label { font-size: 11px; }
      .filter-group input[type="text"],
      .filter-group select { height: 30px; font-size: 12px; padding: 0 8px; }
      .datetime-input-wrap { height: 30px; }
      .datetime-input-wrap input[type="text"] { font-size: 12px; }
      .filter-bar .search-btn,
      .filter-bar .icon-btn { height: 30px; font-size: 12px; }
      .filter-bar .icon-btn { width: 30px; }
    }
  </style>
</head>
<body>
<div class="app-layout">
  <c:set var="activePage" value="history" scope="request"/>
  <%@ include file="/includes/sidebar.jspf" %>

  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Lịch sử thiết bị</h1>
        <div class="subtitle">Theo dõi lịch sử hoạt động thiết bị</div>
      </div>
      <div class="status-badge" id="statusBadge">
        <span class="status-dot"></span> Hoạt động: --/--
      </div>
    </div>

    <div class="card">
      <!-- ================= FILTER BAR: 1 HÀNG NGANG (ĐÃ BỎ TÌM KIẾM NHANH) ================= -->
      <div class="filter-bar">
        <div class="filter-group device-group">
          <label>Thiết bị</label>
          <select class="filter-select" id="deviceFilter">
            <option value="">Tất cả</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Hành động</label>
          <select class="filter-select" id="actionFilter">
            <option value="">Tất cả</option>
            <option value="on">Bật</option>
            <option value="off">Tắt</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Trạng thái</label>
          <select class="filter-select" id="statusFilter">
            <option value="">Tất cả</option>
            <option value="Pending">Đang xử lý</option>
            <option value="Success">Thành công</option>
            <option value="Error">Thất bại</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Số lượng</label>
          <select class="filter-select" id="limitFilter">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Thời gian</label>
          <div class="datetime-input-wrap">
            <input type="text" id="timeFilter" placeholder="dd/MM/yyyy HH:mm">
            <button type="button" class="calendar-icon-btn" id="calendarBtn" title="Chọn thời gian" aria-label="Chọn thời gian">
              <span aria-hidden="true">&#128197;</span>
            </button>
          </div>
          <div class="time-picker-panel" id="timePickerPanel"><div class="time-part-grid"><select id="yearPart" aria-label="Năm"><option value="">Năm</option></select><select id="monthPart" aria-label="Tháng"><option value="">Tháng</option></select><select id="dayPart" aria-label="Ngày"><option value="">Ngày</option></select><select id="hourPart" aria-label="Giờ"><option value="">Giờ</option></select><select id="minutePart" aria-label="Phút"><option value="">Phút</option></select></div><div class="time-picker-actions"><button type="button" class="search-btn" id="applyTimeBtn">Áp dụng</button></div></div>
        </div>

        <button class="search-btn" id="searchBtn"><i class="ti ti-search"></i> Tìm</button>
        <button type="button" class="icon-btn" id="refreshBtn" title="Làm mới dữ liệu" aria-label="Làm mới dữ liệu">
          <i class="ti ti-refresh"></i>
        </button>
      </div>

      <!-- ================= BẢNG (tự cuộn) ================= -->
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã thiết bị</th>
              <th>Thời gian</th>
              <th>Thiết bị</th>
              <th>Hành động</th>
              <th>Người sử dụng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody id="historyTableBody"></tbody>
        </table>
      </div>

      <!-- ================= FOOTER (cố định) ================= -->
      <div class="table-footer">
        <div id="resultInfo">Hiển thị 0 bản ghi</div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/device-history.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const calendarBtn = document.getElementById('calendarBtn');
    const timeFilter = document.getElementById('timeFilter');
    const panel = document.getElementById('timePickerPanel');
    const parts = ['yearPart', 'monthPart', 'dayPart', 'hourPart', 'minutePart'].map(id => document.getElementById(id));
    const addOptions = (select, max, start = 1) => { for (let i = start; i <= max; i++) select.add(new Option(String(i).padStart(2, '0'), i)); };
    const now = new Date();
    for (let year = now.getFullYear() + 1; year >= 2020; year--) parts[0].add(new Option(year, year));
    addOptions(parts[1], 12); addOptions(parts[2], 31); addOptions(parts[3], 23, 0); addOptions(parts[4], 59, 0);
    calendarBtn?.addEventListener('click', () => panel.classList.toggle('open'));
    document.getElementById('applyTimeBtn')?.addEventListener('click', () => {
      const [year, month, day, hour, minute] = parts.map(part => part.value);
      if (!year) { timeFilter.value = ''; }
      else if (!month) { timeFilter.value = year; }
      else if (!day) { timeFilter.value = String(month).padStart(2, '0') + '/' + year; }
      else if (!hour) { timeFilter.value = String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year; }
      else if (!minute) { timeFilter.value = String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year + ' ' + String(hour).padStart(2, '0'); }
      else { timeFilter.value = String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/' + year + ' ' + String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0'); }
      panel.classList.remove('open');
    });
  });
</script>
</body>
</html>
