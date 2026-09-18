<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tài khoản - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<div class="app-layout">
  <c:set var="activePage" value="account" scope="request"/>
  <%@ include file="/includes/sidebar.jspf" %>

  <div class="main-content">
    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header">
      <div>
        <h1>Tài khoản</h1>
        <div class="subtitle">Thông tin cá nhân và cài đặt tài khoản của bạn</div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span> Hệ thống trực tuyến
      </div>
    </div>

    <!-- ===== PROFILE HEADER ===== -->
    <div class="card profile-card" id="profileHeader">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar" id="profileAvatar">?</div>
        <div class="avatar-edit-badge"><i class="ti ti-camera"></i></div>
      </div>
      <div class="profile-info">
        <div class="profile-name" id="profileName">--</div>
        <div class="profile-meta">
          Mã sinh viên: <b id="profileStudentCode">--</b> &nbsp;•&nbsp;
          Vai trò: <b id="profileRole">--</b>
        </div>
      </div>
    </div>

    <!-- ===== THÔNG TIN CÁ NHÂN + TÀI LIỆU HỆ THỐNG ===== -->
    <div class="two-col-grid">
      <!-- Thông tin cá nhân -->
      <div class="card">
        <div class="section-title">Thông tin cá nhân</div>
        <div class="info-row">
          <i class="ti ti-mail"></i>
          <div>
            <div class="label">Địa chỉ Email</div>
            <div class="value" id="profileEmail">--</div>
          </div>
        </div>
        <div class="info-row">
          <i class="ti ti-building"></i>
          <div>
            <div class="label">Trường học</div>
            <div class="value" id="profileSchool">--</div>
          </div>
        </div>
      </div>

      <!-- Tài liệu hệ thống -->
      <div class="card">
        <div class="section-title">Tài liệu hệ thống</div>
        <div class="doc-desc">
          Tài liệu hướng dẫn lắp đặt cảm biến, hiệu chuẩn thông số, lập trình kết nối API
          và tối ưu hóa hệ thống vận hành thông minh IoT Monitor.
        </div>
        <div class="btn-row">
          <button class="btn-outline primary"><i class="ti ti-file-text"></i> Xem tài liệu</button>
          <button class="btn-outline">Tải PDF bản cứng</button>
        </div>
      </div>
    </div>

    <!-- ===== LIÊN KẾT TÍCH HỢP HỆ THỐNG ===== -->
    <div class="section-title section-title--spaced">Liên kết tích hợp hệ thống</div>
    <div class="integration-grid">
      <!-- API Access -->
      <div class="integration-card">
        <div class="integration-head">
          <div>
            <div class="integration-title">
              <i class="ti ti-key" style="color:var(--primary);"></i> API Access
            </div>
            <div class="integration-sub">Khóa truy cập API</div>
          </div>
          <span class="badge-success" id="apiKeyStatus">--</span>
        </div>
        <div class="integration-value" id="apiKeyValue">--</div>
        <button class="btn-outline btn-full" id="regenApiKeyBtn">Tạo lại khóa</button>
      </div>

      <!-- GitHub -->
      <div class="integration-card">
        <div class="integration-head">
          <div>
            <div class="integration-title">
              <i class="ti ti-brand-github"></i> GitHub
            </div>
            <div class="integration-sub">Kết nối kho mã nguồn</div>
          </div>
          <span class="badge-success" id="githubStatus">--</span>
        </div>
        <div class="integration-value" id="githubValue">--</div>
        <button class="btn-outline btn-full">Quản lý</button>
      </div>

      <!-- Figma -->
      <div class="integration-card">
        <div class="integration-head">
          <div>
            <div class="integration-title">
              <i class="ti ti-brand-figma"></i> Figma
            </div>
            <div class="integration-sub">Kết nối thiết kế</div>
          </div>
          <span class="badge-success" id="figmaStatus">--</span>
        </div>
        <div class="integration-value" id="figmaValue">--</div>
        <button class="btn-outline btn-full">Quản lý</button>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/account.js"></script>
</body>
</html>