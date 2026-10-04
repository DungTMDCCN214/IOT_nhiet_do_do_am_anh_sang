<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tổng quan - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.48.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>

  <style>
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

    /* Hàng 3 thẻ cảm biến: chiều cao cố định, gọn */
    .card-grid-3 {
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      height: 120px;
    }

    /* Hàng dưới: biểu đồ + panel thiết bị chiếm hết phần còn lại */
    .dashboard-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      min-height: 0; /* cho phép con co giãn trong flex */
    }

    .dashboard-grid > .card {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      padding: 16px;
      box-sizing: border-box;
    }

    /* Vùng chứa biểu đồ co giãn theo card */
    .chart-container {
      flex: 1;
      position: relative;
      min-height: 0;
    }

    .chart-container canvas {
      position: absolute;
      inset: 0;
      width: 100% !important;
      height: 100% !important;
    }

    /* Panel thiết bị: danh sách tự cuộn bên trong */
    #deviceList {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding-right: 4px;
    }

    /* Tinh chỉnh thẻ cảm biến cho vừa 120px */
    #sensorCards .card {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  </style>
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

    <div class="dashboard-grid">
      <!-- Biểu đồ 12h -->
      <div class="card">
        <div style="font-weight:600; margin-bottom:12px; flex-shrink:0;">
          Lịch sử chỉ số cảm biến (12h qua)
        </div>
        <div class="chart-container">
          <canvas id="sensorChart"></canvas>
        </div>
      </div>

      <!-- Panel điều khiển thiết bị -->
      <div class="card">
        <div style="font-weight:600; flex-shrink:0;">Hệ thống thiết bị</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px; flex-shrink:0;">
          Bật / tắt và theo dõi trạng thái
        </div>
        <div id="deviceList"></div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/dashboard.js"></script>
</body>
</html>