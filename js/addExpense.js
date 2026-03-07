function populateFormSelects() {
  document.getElementById("inp-date").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("inp-cat").innerHTML = (state.categories || [])
    .map((c) => `<option>${c}</option>`)
    .join("");
  document.getElementById("inp-account").innerHTML = (state.accounts || [])
    .map((a) => `<option>${a}</option>`)
    .join("");
}
function addExpense() {
  const amt = parseFloat(document.getElementById("inp-amount").value);
  const desc = document.getElementById("inp-desc").value.trim();
  const date = document.getElementById("inp-date").value;
  const cat = document.getElementById("inp-cat").value;
  const acc = document.getElementById("inp-account").value;
  const notes = document.getElementById("inp-notes").value.trim();
  if (!amt || amt <= 0) {
    showToast("⚠️ Enter a valid amount");
    return;
  }
  if (!desc) {
    showToast("⚠️ Enter a description");
    return;
  }
  if (!date) {
    showToast("⚠️ Select a date");
    return;
  }
  state.transactions.push({
    id: Date.now().toString(),
    amount: amt,
    description: desc,
    date,
    category: cat,
    account: acc,
    notes,
  });
  saveState();
  document.getElementById("inp-amount").value = "";
  document.getElementById("inp-desc").value = "";
  document.getElementById("inp-notes").value = "";
  showToast("✅ Expense added!");
}
