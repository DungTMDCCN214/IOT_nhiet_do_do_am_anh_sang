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

function renderAvatar(element, avatarUrl, fullName) {
  const fallback = (fullName || "?").trim().charAt(0).toUpperCase() || "?";
  if (!avatarUrl) {
    element.textContent = fallback;
    return;
  }

  const image = new Image();
  image.alt = "Ảnh đại diện";
  image.onload = () => {
    element.replaceChildren(image);
  };
  image.onerror = () => {
    element.textContent = fallback;
  };
  image.src = avatarUrl;
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
      renderAvatar(
        document.getElementById("profileAvatar"),
        user.avatarUrl,
        user.fullName,
      );
      const sidebarAvatar = document.getElementById("sidebarAvatar");
      if (sidebarAvatar)
        renderAvatar(sidebarAvatar, user.avatarUrl, user.fullName);
      document.getElementById("profileName").textContent =
        user.fullName || "--";
      document.getElementById("profileStudentCode").textContent =
        user.studentCode || "--";
      document.getElementById("profileRole").textContent = user.role || "--";
      document.getElementById("profileEmail").textContent =
        user.username || "--";
      document.getElementById("profileSchool").textContent =
        user.school || "--";

      setIntegrationCard("apiKey", user.apiKey, "Đã kết nối");
      setIntegrationCard("github", user.github, "Đã kết nối");
      setIntegrationCard("figma", user.figma, "Đã kết nối");
    })
    .catch(() => {});
}

loadProfile();
