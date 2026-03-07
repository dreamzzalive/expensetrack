function importCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const lines = ev.target.result.split("\n").filter((l) => l.trim());
    let imported = 0,
      errors = 0;
    lines.forEach((line, i) => {
      if (i === 0 && line.toLowerCase().includes("date")) return;
      const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      const [date, description, amount, category, account] = parts;
      const amt = parseFloat(amount);
      if (!date || !description || isNaN(amt) || amt <= 0) {
        errors++;
        return;
      }
      const cat =
        category && (state.categories || []).includes(category)
          ? category
          : (state.categories || ["Others"])[0];
      const acc =
        account && (state.accounts || []).includes(account)
          ? account
          : (state.accounts || ["Cash"])[0];
      state.transactions.push({
        id: Date.now().toString() + Math.random(),
        amount: amt,
        description,
        date,
        category: cat,
        account: acc,
        notes: "",
      });
      imported++;
    });
    saveState();
    document.getElementById("csv-status").textContent =
      `✅ Imported ${imported} rows${errors ? " (" + errors + " skipped)" : ""}`;
    showToast(`Imported ${imported} transactions`);
  };
  reader.readAsText(file);
}
function exportCSV() {
  const rows = [
    ["date", "description", "amount", "category", "account", "notes"],
  ];
  [...state.transactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((t) =>
      rows.push([
        t.date,
        t.description,
        t.amount,
        t.category,
        t.account,
        t.notes || "",
      ]),
    );
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "expensetrack_export.csv";
  a.click();
  showToast("✅ CSV exported");
}
