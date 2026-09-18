<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Lịch sử thiết bị - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
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
      <div class="filter-bar">
        <div class="filter-group">
          <label>Tìm kiếm nhanh</label>
          <div class="search-input-wrap">
            <i class="ti ti-search"></i>
            <input type="text" id="searchInput" placeholder="Tìm kiếm theo mã thiết bị...">
          </div>
        </div>

        <div class="filter-group">
          <label>Thiết bị</label>
          <select class="filter-select" id="deviceFilter">
            <option value="">Tất cả</option>
          </select>
        </div>

        <div class="filter-group">
          <label>H&agrave;nh &#273;&#7897;ng</label>
          <select class="filter-select" id="actionFilter">
            <option value="">T&#7845;t c&#7843;</option>
            <option value="on">B&#7853;t</option>
            <option value="off">T&#7855;t</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tr&#7841;ng th&aacute;i</label>
          <select class="filter-select" id="statusFilter">
            <option value="">T&#7845;t c&#7843;</option>
            <option value="Pending">&#272;ang x&#7917; l&yacute;</option>
            <option value="Success">Th&agrave;nh c&ocirc;ng</option>
            <option value="Error">Th&#7845;t b&#7841;i</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Số lượng</label>
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

      <div class="table-footer">
        <div id="resultInfo">Hiển thị 0 bản ghi</div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/device-history.js"></script>
</body>
</html>
