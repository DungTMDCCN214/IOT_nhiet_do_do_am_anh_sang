<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Đăng nhập - Hestia SmartHome</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/dist/tabler-icons.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon"><i class="ti ti-home"></i></div>
      <h1>Hestia SmartHome</h1>
      <div class="sub">Điều khiển &amp; Giám sát ngôi nhà của bạn</div>

      <div class="error-msg" id="errorMsg"></div>

      <form id="loginForm">
        <div class="form-group">
          <label>Tài khoản</label>
          <div class="input-wrap">
            <i class="ti ti-mail"></i>
            <input type="text" id="email" placeholder="username" required>
          </div>
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrap">
            <i class="ti ti-lock"></i>
            <input type="password" id="password" placeholder="••••••••" required>
          </div>
        </div>
        <button type="submit" class="btn-primary">Đăng nhập</button>
      </form>

      <div class="login-footer">Chưa có tài khoản? <a href="#" style="color:var(--primary);font-weight:600;">Đăng ký ngay</a></div>
    </div>
  </div>

  <script src="/assets/js/login.js"></script>
</body>
</html>
