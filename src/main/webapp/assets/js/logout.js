document.getElementById("logoutBtn").addEventListener("click", () => {
  fetch("/api/logout", { method: "POST" }).then(
    () => (window.location.href = "/login"),
  );
});
