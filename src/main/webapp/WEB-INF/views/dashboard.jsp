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

    /* Hàng 3 thẻ cảm biến */
    .card-grid-3 {
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      height: 120px;
      margin-bottom: 0;
    }

    /* Hàng dưới */
    .dashboard-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      min-height: 0;
    }

    .dashboard-grid > .card {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      padding: 16px;
      box-sizing: border-box;
    }

    /* ===== BỐ CỤC KHUNG BIỂU ĐỒ CỐ ĐỊNH TRỤC Y ===== */
    .chart-main-wrapper {
      flex: 1;
      display: flex;
      position: relative;
      min-height: 0;
      overflow: hidden;
      border-radius: 8px;
    }

    /* Khung chứa Trục Y cố định bên trái (Rộng 60px hiển thị đầy đủ số 3 chữ số) */
    .y-axis-container {
      width: 60px;
      flex-shrink: 0;
      height: 100%;
      position: relative;
      background: #ffffff;
      z-index: 2;
      border-right: 1px solid var(--border);
    }
    .y-axis-container canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }

    /* Khung trượt chứa Đồ thị chính bên phải */
    .chart-scroll-container {
      flex: 1;
      position: relative;
      min-height: 0;
      overflow-x: auto;
      overflow-y: hidden;
    }

    /* Custom thanh trượt cuộn ngang */
    .chart-scroll-container::-webkit-scrollbar {
      height: 6px;
    }
    .chart-scroll-container::-webkit-scrollbar-track {
      background: var(--page-bg);
      border-radius: 4px;
    }
    .chart-scroll-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .chart-scroll-container::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .chart-scroll-wrapper {
      height: 100%;
      min-width: 100%;
      position: relative;
    }
    .chart-scroll-wrapper canvas {
      height: 100% !important;
      width: 100% !important;
    }

    /* Panel thiết bị */
    #deviceList {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding-right: 4px;
    }

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
      <!-- Biểu đồ có TRỤC Y CỐ ĐỊNH + TRƯỢT NGANG DỮ LIỆU -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
          <div style="font-weight:600;">Lịch sử chỉ số cảm biến</div>
          <div style="font-size:11px; color:var(--text-secondary);">
            <i class="ti ti-arrows-left-right"></i> Kéo ngang để xem lịch sử
          </div>
        </div>

        <div class="chart-main-wrapper">
          <!-- Trục Y cố định bên trái -->
          <div class="y-axis-container">
            <canvas id="yAxisChart"></canvas>
          </div>
          <!-- Vùng trượt ngang đồ thị bên phải -->
          <div class="chart-scroll-container" id="chartScrollContainer">
            <div class="chart-scroll-wrapper" id="chartScrollWrapper">
              <canvas id="sensorChart"></canvas>
            </div>
          </div>
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