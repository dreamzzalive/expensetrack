function renderSettings() {
  renderUserArea();
  document.getElementById("cat-tags").innerHTML = (state.categories || [])
    .map(
      (c) =>
        `<span class="tag">${c}<span class="tag-del" onclick="deleteCategory('${c}')">×</span></span>`,
    )
    .join("");
  document.getElementById("acc-tags").innerHTML = (state.accounts || [])
    .map(
      (a) =>
        `<span class="tag">${a}<span class="tag-del" onclick="deleteAccount('${a}')">×</span></span>`,
    )
    .join("");
}
function renderUserArea() {
  const ua = document.getElementById("settings-user-area");
  if (currentUser) {
    const i = (currentUser.displayName || currentUser.email || "U")
      .slice(0, 1)
      .toUpperCase();
    ua.innerHTML = `<div class="user-pill"><div class="user-pill-avatar">${i}</div><div class="user-pill-info"><div class="user-pill-name">${currentUser.displayName || "User"}</div><div class="user-pill-email">${currentUser.email}</div></div><button onclick="doLogout()">Sign Out</button></div>`;
  } else if (FIREBASE_READY) {
    ua.innerHTML = `<div class="settings-row" onclick="openAuthModal()"><div><div class="settings-row-label">Sign In / Sign Up</div><div class="settings-row-sub">Sync data across all your devices</div></div><span style="font-size:20px;color:var(--primary)">›</span></div>`;
  } else {
    ua.innerHTML = `<div class="settings-row"><div><div class="settings-row-label">Demo Mode</div><div class="settings-row-sub">Add Firebase config to enable cloud sync</div></div></div>`;
  }
}
function addCategory() {
  const v = document.getElementById("new-cat-input").value.trim();
  if (!v || (state.categories || []).includes(v)) {
    showToast("⚠️ Invalid or duplicate");
    return;
  }
  state.categories.push(v);
  saveState();
  renderSettings();
  document.getElementById("new-cat-input").value = "";
  showToast("✅ Category added");
}
function deleteCategory(c) {
  if ((state.categories || []).length <= 1) {
    showToast("⚠️ Keep at least 1");
    return;
  }
  state.categories = state.categories.filter((x) => x !== c);
  saveState();
  renderSettings();
  showToast("Deleted");
}
function addAccount() {
  const v = document.getElementById("new-acc-input").value.trim();
  if (!v || (state.accounts || []).includes(v)) {
    showToast("⚠️ Invalid or duplicate");
    return;
  }
  state.accounts.push(v);
  saveState();
  renderSettings();
  document.getElementById("new-acc-input").value = "";
  showToast("✅ Account added");
}
function deleteAccount(a) {
  if ((state.accounts || []).length <= 1) {
    showToast("⚠️ Keep at least 1");
    return;
  }
  state.accounts = state.accounts.filter((x) => x !== a);
  saveState();
  renderSettings();
  showToast("Deleted");
}
function clearAllData() {
  if (!confirm("Clear ALL transactions? Cannot be undone.")) return;
  state.transactions = [];
  saveState();
  renderDashboard();
  showToast("All data cleared");
}
