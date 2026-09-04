<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tổng quan - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
</head>
<body>
<div class="app-layout">
  <c:set var="activePage" value="dashboard" scope="request"/>
  <%@ include file="/includes/sidebar.jspf" %>

  <div class="main-content">
    <div class="page-header">
      <div>
        <h1>Tổng quan hệ thống</h1>
      </div>
    </div>

    <!-- 3 thẻ chỉ số cảm biến -->
    <div class="card-grid-3" id="sensorCards">
      <!-- JS render động -->
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:16px;">
      <!-- Biểu đồ 12h -->
      <div class="card">
        <div style="font-weight:600; margin-bottom:12px;">Lịch sử chỉ số cảm biến (12h qua)</div>
        <canvas id="sensorChart" height="220"></canvas>
      </div>

      <!-- Panel điều khiển thiết bị -->
      <div class="card">
        <div style="font-weight:600;">Hệ thống thiết bị</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">Bật / tắt và theo dõi trạng thái</div>
        <div id="deviceList"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/dashboard.js"></script>
</body>
</html>
