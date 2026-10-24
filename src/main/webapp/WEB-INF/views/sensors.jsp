<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Cảm biến - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <style>
    /* ================= BỐ CỤC KHÔNG CUỘN TOÀN TRANG ================= */
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

    /* ===== FILTER BAR LINH HOẠT ===== */
    .filter-bar {
      flex-shrink: 0;
      display: flex;
      flex-wrap: nowrap;
      gap: 12px;
      align-items: flex-end;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border, #e5e7eb);
      overflow: visible;
    }

    .filter-group {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-group.criteria-group {
      width: 180px;
    }
    .filter-group.value-group {
      flex: 1;
      min-width: 220px;
    }

    .filter-group label {
      font-size: 12px;
      color: var(--text-secondary, #6b7280);
      font-weight: 500;
    }

    /* STYLE CHO INPUT / SELECT */
    .filter-group input[type="text"],
    .filter-group input[type="number"],
    .filter-group select {
      width: 100%;
      height: 36px;
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
    .filter-group input:focus,
    .filter-group select:focus {
      border-color: var(--primary, #2563eb);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    .filter-group select {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 28px;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 14px;
      cursor: pointer;
    }

    /* Ô thời gian */
    .datetime-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 36px;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 8px;
      background: #fff;
    }
    .datetime-input-wrap input[type="text"] {
      flex: 1;
      border: none;
      outline: none;
      padding: 0 40px 0 10px;
      height: 100%;
      background: transparent;
    }
    .datetime-input-wrap .calendar-icon-btn {
      position: absolute;
      right: 0;
      top: 0;
      width: 36px;
      height: 100%;
      background: #f8fafc;
      border: 0;
      border-left: 1px solid var(--border, #d1d5db);
      border-radius: 0 7px 7px 0;
      cursor: pointer;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .datetime-input-wrap .calendar-icon-btn:hover {
      color: #fff;
      background: var(--primary, #2563eb);
    }
    
    .time-picker-panel {
      display: none;
      position: absolute;
      left: 0;
      top: calc(100% + 6px);
      z-index: 100;
      width: 260px;
      padding: 10px;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
    }
    .time-picker-panel.open { display: block; }
    .time-part-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .time-part-grid select { height: 32px; }
    .time-picker-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }

    /* Nút bấm */
    .search-btn {
      height: 36px;
      padding: 0 16px;
      border-radius: 8px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary, #2563eb);
      color: #fff;
      border: none;
      cursor: pointer;
    }
    .search-btn:hover { opacity: 0.9; }

    .icon-btn {
      height: 36px;
      width: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid var(--border, #d1d5db);
      background: #fff;
      color: #374151;
      cursor: pointer;
      font-size: 16px;
    }
    .icon-btn:hover { background: #f3f4f6; color: var(--primary, #2563eb); }



        /* Style cho nút Copy thời gian */
    .copy-btn {
      background: transparent;
      border: 1px solid transparent;
      color: #eeea0d; /* Màu vang */
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      opacity: 0.7; /* Mờ đi khi không hover */
    }

    /* Khi hover vào dòng, nút hiện rõ lên */
    .table-scroll tbody tr:hover .copy-btn {
      opacity: 1;
      background: #d9e712;
      border-color: #e2df1e;
      color: var(--primary, #2563eb);
    }

    .copy-btn:hover {
      background: #dbeafe !important;
      color: var(--primary, #2563eb) !important;
    }

    /* Hiệu ứng cho thông báo Toast */
    @keyframes fadeInOut {
      0% { opacity: 0; bottom: 10px; }
      10% { opacity: 1; bottom: 20px; }
      90% { opacity: 1; bottom: 20px; }
      100% { opacity: 0; bottom: 30px; }
    }
    /* ===== BẢNG CUỘN ===== */
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
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary, #6b7280);
    }
    .limit-select-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .limit-select-wrap select {
      height: 30px;
      border-radius: 6px;
      border: 1px solid var(--border, #d1d5db);
      padding: 0 6px;
      font-size: 12px;
      outline: none;
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

    /* Đổi màu loại cảm biến */
    .type-temp  { color:#DC2626; font-weight:500; }
    .type-hum   { color:#2563EB; font-weight:500; }
    .type-light { color:#F59E0B; font-weight:500; }
    .mono-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color:#6b7280; }
  </style>
</head>
<body>
<div class="app-layout">
  <c:set var="activePage" value="sensors" scope="request"/>
  <%@ include file="/includes/sidebar.jspf" %>

  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Cảm biến</h1>
        <div class="subtitle">Quản lý dữ liệu cảm biến</div>
      </div>
      <div class="status-badge" id="statusBadge">
        <span class="status-dot"></span> Hoạt động: --/--
      </div>
    </div>

    <div class="card">
      <!-- ================= THANH BỘ LỌC ĐỘNG (DYNAMICTIC FILTER) ================= -->
      <div class="filter-bar">
        <!-- Ô 1: Chọn tiêu chí -->
        <div class="filter-group criteria-group">
          <label>Tiêu chí tìm kiếm</label>
          <select id="criteriaSelect">
            <option value="all">Tất cả</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="humidity">Độ ẩm</option>
            <option value="light">Ánh sáng</option>
            <option value="type">Loại cảm biến</option>
            <option value="time">Thời gian</option>
          </select>
        </div>

        <!-- Ô 2: Ô nhập/chọn giá trị linh hoạt theo tiêu chí -->
        <div class="filter-group value-group" id="filterValueContainer">
          <label id="valueLabel">Giá trị tìm kiếm</label>
          <input type="text" id="valueInput" placeholder="Tất cả dữ liệu" disabled />
        </div>

        <!-- Nút Tìm & Làm mới -->
        <button class="search-btn" id="searchBtn"><i class="ti ti-search"></i> Tìm</button>
        <button type="button" class="icon-btn" id="refreshBtn" title="Làm mới dữ liệu">
          <i class="ti ti-refresh"></i> Đặt
        </button>
      </div>

      <!-- ================= BẢNG DỮ LIỆU ================= -->
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã bản ghi</th>
              <th>Thời gian</th>
              <th>Loại cảm biến</th>
              <th>Giá trị đo được</th>
            </tr>
          </thead>
          <tbody id="sensorTableBody"></tbody>
        </table>
      </div>

      <!-- ================= FOOTER (CHÂN TRANG) ================= -->
      <div class="table-footer">
        <div class="footer-left">
          <div id="resultInfo">Hiển thị 0 bản ghi</div>
          <div class="limit-select-wrap">
            <span>Hiển thị:</span>
            <select id="limitFilter">
              <option value="10" selected>10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>bản ghi/trang</span>
          </div>
        </div>

        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/sensors.js"></script>
</body>
</html>