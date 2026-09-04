function maskApiKey(key) {
  if (!key || key.length < 8) return key || "--";
  return key.slice(0, 6) + "..." + key.slice(-4);
}

function setIntegrationCard(prefix, value, connectedLabel) {
  const statusEl = document.getElementById(`${prefix}Status`);
  const valueEl = document.getElementById(`${prefix}Value`);

  if (value) {
    statusEl.textContent = connectedLabel;
    statusEl.className = "badge-success";
    valueEl.textContent = value;
  } else {
    statusEl.textContent = "Chưa kết nối";
    statusEl.className = "badge-danger";
    valueEl.textContent = "--";
  }
}

function loadProfile() {
  fetch("/api/users/me")
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("unauth");
      }
      return res.json();
    })
    .then((user) => {
      document.getElementById("profileAvatar").textContent = (
        user.fullName || "?"
      ).charAt(0);
      document.getElementById("profileName").textContent =
        user.fullName || "--";
      document.getElementById("profileStudentCode").textContent =
        user.studentCode || "--";
      document.getElementById("profileRole").textContent = user.role || "--";
      document.getElementById("profileEmail").textContent =
        user.username || "--";
      document.getElementById("profileSchool").textContent =
        user.school || "--";

      setIntegrationCard("apiKey", maskApiKey(user.apiKey), "Hoạt động");
      setIntegrationCard("github", user.github, "Đã kết nối");
      setIntegrationCard("figma", user.figma, "Đã kết nối");
    })
    .catch(() => {});
}

document.getElementById("regenApiKeyBtn").addEventListener("click", () => {
  if (!confirm("Tạo lại khóa API sẽ vô hiệu hóa khóa cũ. Tiếp tục?")) return;

  fetch("/api/users/me/regenerate-api-key", { method: "POST" })
    .then((res) => res.json())
    .then((user) => {
      setIntegrationCard("apiKey", maskApiKey(user.apiKey), "Hoạt động");
    });
});

loadProfile();
