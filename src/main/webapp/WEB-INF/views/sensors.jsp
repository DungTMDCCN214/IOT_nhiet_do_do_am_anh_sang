<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Cảm biến - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
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
      <div class="filter-bar">
        <div class="filter-group">
          <label>Tìm kiếm nhanh</label>
          <div class="search-input-wrap">
            <i class="ti ti-search"></i>
            <input type="text" id="searchInput" placeholder="Tìm kiếm theo mã bản ghi">
          </div>
        </div>

        <div class="filter-group">
          <label>Loại cảm biến</label>
          <select class="filter-select" id="typeFilter">
            <option value="">Tất cả</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="humidity">Độ ẩm</option>
            <option value="light">Ánh sáng</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Số bản ghi</label>
          <select class="filter-select" id="limitFilter">
            <option value="10">10 bản ghi</option>
            <option value="20">20 bản ghi</option>
            <option value="50">50 bản ghi</option>
          </select>
        </div>

        
        <button class="search-btn" id="searchBtn"><i class="ti ti-search"></i> Tìm kiếm</button>
        <button type="button" class="icon-btn" id="refreshBtn" title="Làm mới dữ liệu" aria-label="Làm mới dữ liệu"><i class="ti ti-refresh"></i></button>
      </div>

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

      <div class="table-footer">
        <div id="resultInfo">Hiển thị 0 bản ghi</div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/sensors.js"></script>
</body>
</html>
