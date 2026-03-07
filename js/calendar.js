let calMonth = new Date();
calMonth.setDate(1);
let calSelected = null;
function calChangeMonth(d) {
  calMonth.setMonth(calMonth.getMonth() + d);
  renderCalendar();
}
function renderCalendar() {
  const y = calMonth.getFullYear(),
    m = calMonth.getMonth();
  document.getElementById("cal-month-label").textContent =
    calMonth.toLocaleDateString("en-SG", { month: "long", year: "numeric" });
  let html = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    .map((d) => `<div class="cal-day-label">${d}</div>`)
    .join("");
  const first = new Date(y, m, 1).getDay(),
    dim = new Date(y, m + 1, 0).getDate(),
    today = new Date().toISOString().split("T")[0];
  const txDates = new Set(
    state.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .map((t) => t.date),
  );
  for (let i = 0; i < first; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    html += `<div class="cal-day${ds === today ? " today" : ""}${ds === calSelected ? " selected" : ""}${txDates.has(ds) ? " has-tx" : ""}" onclick="calSelectDay('${ds}')">${d}</div>`;
  }
  document.getElementById("cal-grid").innerHTML = html;
  renderCalTxList();
}
function calSelectDay(ds) {
  calSelected = ds;
  renderCalendar();
}
function renderCalTxList() {
  const sec = document.getElementById("cal-tx-section");
  if (!calSelected) {
    sec.innerHTML = "";
    return;
  }
  const txs = state.transactions
    .filter((t) => t.date === calSelected)
    .sort((a, b) => b.amount - a.amount);
  const total = txs.reduce((s, t) => s + t.amount, 0);
  sec.innerHTML =
    `<div class="cal-date-label">${calSelected}${txs.length ? " — $" + total.toFixed(2) : ""}</div>` +
    (txs.length
      ? `<div class="cal-tx-list">${txs.map((t) => txCard(t, true)).join("")}</div>`
      : '<div class="empty-state">No transactions on this day</div>');
}
