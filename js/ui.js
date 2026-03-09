// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
function showPage(name, btn) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  if (btn) btn.classList.add("active");
  if (name === "add") populateFormSelects();
  if (name === "calendar") renderCalendar();
  if (name === "analytics") renderAnalytics();
  if (name === "settings") renderSettings();
  if (name === "budget") renderBudget();
  if (name === "dashboard") renderDashboard();
}
function txCard(t, del) {
  const color = getCatColor(t.category);
  const emoji = EMOJIS[t.category] || "💳";
  return (
    '<div class="tx-item"><div class="tx-icon" style="background:' +
    color +
    '22">' +
    emoji +
    '</div><div class="tx-info"><div class="tx-cat" style="color:' +
    color +
    '">' +
    t.category +
    "</div>" +
    (t.description ? '<div class="tx-desc">' + t.description + "</div>" : "") +
    '<div class="tx-meta">' +
    t.account +
    " · " +
    t.date +
    '</div></div><div class="tx-amt" style="color:var(--danger)">$' +
    t.amount.toFixed(2) +
    "</div>" +
    (del
      ? '<button class="tx-del" onclick="deleteTx(\'' + t.id + "')\">✕</button>"
      : "") +
    "</div>"
  );
}
function incCard(t, del) {
  const color = getIncColor(t.category);
  const emoji = getIncEmoji(t.category);
  return (
    '<div class="tx-item"><div class="tx-icon" style="background:' +
    color +
    '22">' +
    emoji +
    '</div><div class="tx-info"><div class="tx-cat" style="color:' +
    color +
    '">' +
    t.category +
    "</div>" +
    (t.description ? '<div class="tx-desc">' + t.description + "</div>" : "") +
    '<div class="tx-meta">' +
    t.account +
    " · " +
    t.date +
    '</div></div><div class="tx-amt" style="color:#10b981">+$' +
    t.amount.toFixed(2) +
    "</div>" +
    (del
      ? '<button class="tx-del" onclick="deleteInc(\'' +
        t.id +
        "')\">✕</button>"
      : "") +
    "</div>"
  );
}
function trCard(t) {
  const fc = getAccColor(t.from);
  const tc = getAccColor(t.to);
  return (
    '<div class="tx-item"><div class="tx-icon" style="background:#e0f2fe">🔄</div><div class="tx-info"><div class="tx-cat" style="color:#0ea5e9">Transfer</div>' +
    (t.description ? '<div class="tx-desc">' + t.description + "</div>" : "") +
    '<div class="tx-meta"><span style="color:' +
    fc +
    ';font-weight:700">' +
    t.from +
    '</span> → <span style="color:' +
    tc +
    ';font-weight:700">' +
    t.to +
    "</span> · " +
    t.date +
    '</div></div><div class="tx-amt" style="color:#0ea5e9">$' +
    t.amount.toFixed(2) +
    '</div><button class="tx-del" onclick="deleteTr(\'' +
    t.id +
    "')\">✕</button></div>"
  );
}
function deleteTx(id) {
  st.transactions = st.transactions.filter((t) => t.id !== id);
  save();
  renderDashboard();
  renderCalTxList();
  showToast("Deleted");
}
function deleteInc(id) {
  st.income = st.income.filter((t) => t.id !== id);
  save();
  renderDashboard();
  showToast("Deleted");
}
function deleteTr(id) {
  st.transfers = st.transfers.filter((t) => t.id !== id);
  save();
  renderDashboard();
  showToast("Deleted");
}
function barChart(el, entries, colorFn) {
  if (!el) return;
  if (!entries.length) {
    el.innerHTML =
      '<div class="empty-state" style="padding:18px">No data yet</div>';
    return;
  }
  const max = entries[0][1];
  el.innerHTML = entries
    .map(
      ([k, v]) =>
        '<div class="bc-row"><div class="bc-label" title="' +
        k +
        '">' +
        k +
        '</div><div class="bc-track"><div class="bc-fill" style="width:' +
        ((v / max) * 100).toFixed(1) +
        "%;background:" +
        colorFn(k) +
        '"></div></div><div class="bc-amt" style="color:' +
        colorFn(k) +
        '">$' +
        v.toFixed(0) +
        "</div></div>",
    )
    .join("");
}
function donut(svgId, legId, entries, total, colorFn) {
  const r = 60,
    cx = 75,
    cy = 75,
    sw = 22,
    c = 2 * Math.PI * r;
  let off = 0,
    p = "";
  entries.forEach(([k, v]) => {
    const col = colorFn(k),
      d = (v / total) * c;
    p +=
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="' +
      col +
      '" stroke-width="' +
      sw +
      '" stroke-dasharray="' +
      d +
      " " +
      (c - d) +
      '" stroke-dashoffset="' +
      -off +
      '" transform="rotate(-90 ' +
      cx +
      " " +
      cy +
      ')"/>';
    off += d;
  });
  if (!entries.length)
    p =
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="#e8eaf0" stroke-width="' +
      sw +
      '"/>';
  const sv = document.getElementById(svgId);
  const le = document.getElementById(legId);
  if (sv)
    sv.innerHTML =
      '<svg width="150" height="150" viewBox="0 0 150 150">' +
      p +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 5) +
      '" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1a2e">$' +
      (entries.length ? total.toFixed(0) : "0") +
      "</text></svg>";
  if (le)
    le.innerHTML = entries
      .map(
        ([k, v]) =>
          '<div class="legend-item"><div class="legend-left"><span class="cat-dot" style="background:' +
          colorFn(k) +
          '"></span>' +
          k +
          '</div><div class="legend-pct">' +
          ((v / total) * 100).toFixed(1) +
          "% · $" +
          v.toFixed(2) +
          "</div></div>",
      )
      .join("");
}
