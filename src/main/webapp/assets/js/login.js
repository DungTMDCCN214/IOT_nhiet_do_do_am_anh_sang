document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.style.display = "none";

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        errorMsg.textContent = data.message || "Sai tài khoản hoặc mật khẩu";
        errorMsg.style.display = "block";
      }
    })
    .catch(() => {
      errorMsg.textContent = "Không kết nối được tới server";
      errorMsg.style.display = "block";
    });
});
