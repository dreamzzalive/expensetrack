// ═══════════════════════════════════════════════════════════════
// RECURRING TRANSACTIONS
// ═══════════════════════════════════════════════════════════════
let recCurrentType = 'expense';

function initRecurring(){
  if(!st.recurring) st.recurring = [];
}

async function processRecurring(){
  initRecurring();
  const today = new Date(); today.setHours(0,0,0,0);
  let added = 0;
  st.recurring.forEach(function(rule){
    if(!rule.active) return;
    let next = getNextDue(rule);
    while(next <= today){
      const dateStr = toDateStr(next);
      const arr = rule.type === 'income' ? (st.income||[]) : st.transactions;
      const exists = arr.some(function(t){ return t.recurringId === rule.id && t.date === dateStr; });
      if(!exists){
        const tx = {
          id: 'rec_' + rule.id + '_' + dateStr + '_' + Math.random().toString(36).slice(2),
          amount: rule.amount,
          description: rule.description || rule.category,
          date: dateStr,
          category: rule.category,
          account: rule.account,
          notes: 'Recurring',
          recurringId: rule.id
        };
        if(rule.type === 'income'){ if(!st.income) st.income=[]; st.income.push(tx); }
        else st.transactions.push(tx);
        added++;
      }
      rule.lastRun = dateStr;
      next = advanceDate(next, rule.frequency);
    }
  });
  if(added > 0){
    saveLocal();
    await saveCloud();
    showToast('🔁 ' + added + ' recurring transaction' + (added > 1 ? 's' : '') + ' added');
    if(typeof renderDashboard === 'function') renderDashboard();
    if(typeof renderCalendar  === 'function') renderCalendar();
  }
}

function toDateStr(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function parseDate(str){ return new Date(str + 'T00:00:00'); }
function getNextDue(rule){
  return rule.lastRun ? advanceDate(parseDate(rule.lastRun), rule.frequency) : parseDate(rule.startDate);
}
function advanceDate(d, freq){
  const n = new Date(d);
  if(freq === 'daily')   n.setDate(n.getDate() + 1);
  if(freq === 'weekly')  n.setDate(n.getDate() + 7);
  if(freq === 'monthly') n.setMonth(n.getMonth() + 1);
  if(freq === 'yearly')  n.setFullYear(n.getFullYear() + 1);
  return n;
}

function switchRecType(type, btn){
  recCurrentType = type;
  document.querySelectorAll('.rec-type-tab').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  refreshRecSelects(type);
}

function refreshRecSelects(type){
  const catSel = document.getElementById('rec-cat');
  const accSel = document.getElementById('rec-acc');
  if(!catSel || !accSel) return;
  const t = type || recCurrentType;
  const cats = t === 'income'
    ? (st.incomeCategories && st.incomeCategories.length ? st.incomeCategories : DEFAULT_INCOME_CATEGORIES)
    : (st.categories && st.categories.length ? st.categories : DEFAULT_CATEGORIES);
  const accs = st.accounts && st.accounts.length ? st.accounts : DEFAULT_ACCOUNTS;
  catSel.innerHTML = cats.map(function(c){ return '<option value="' + c + '">' + c + '</option>'; }).join('');
  accSel.innerHTML = accs.map(function(a){ return '<option value="' + a + '">' + a + '</option>'; }).join('');
  const startEl = document.getElementById('rec-start');
  if(startEl && !startEl.value) startEl.value = toDateStr(new Date());
}

function renderRecurring(){
  initRecurring();
  refreshRecSelects(recCurrentType);
  const expBtn = document.getElementById('rec-type-exp');
  const incBtn = document.getElementById('rec-type-inc');
  if(expBtn) expBtn.classList.toggle('active', recCurrentType === 'expense');
  if(incBtn) incBtn.classList.toggle('active', recCurrentType === 'income');
  renderRecurringList();
}

function renderRecurringList(){
  const list = document.getElementById('recurring-list');
  if(!list) return;
  if(!st.recurring || !st.recurring.length){
    list.innerHTML = '<div class="empty-state">No recurring rules yet.<br>Add one above to get started.</div>';
    return;
  }
  list.innerHTML = '';
  st.recurring.forEach(function(rule){
    const card = buildRecCard(rule);
    list.appendChild(card);
  });
}

function buildRecCard(rule){
  const isInc   = rule.type === 'income';
  const color   = isInc ? getIncColor(rule.category) : getCatColor(rule.category);
  const emoji   = isInc ? getIncEmoji(rule.category) : (EMOJIS[rule.category] || '💳');
  const freqLbl = {daily:'Daily', weekly:'Weekly', monthly:'Monthly', yearly:'Yearly'}[rule.frequency] || rule.frequency;
  const nextDue = toDateStr(getNextDue(rule));
  const amtCol  = isInc ? '#10b981' : '#f04a4a';
  const amtSign = isInc ? '+' : '-';
  const typeLbl = isInc ? '💰 Income' : '💸 Expense';

  const div = document.createElement('div');
  div.className = 'rec-card' + (rule.active ? '' : ' rec-card-paused');

  const inner = document.createElement('div');
  inner.style.cssText = 'display:flex;align-items:center;gap:10px;';

  const icon = document.createElement('div');
  icon.style.cssText = 'width:42px;height:42px;border-radius:12px;background:' + color + '22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;';
  icon.textContent = emoji;

  const info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;';
  info.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;">' +
      '<span style="font-size:14px;font-weight:700;color:' + color + ';">' + rule.category + '</span>' +
      '<span style="font-size:10px;background:' + color + '22;color:' + color + ';border-radius:99px;padding:2px 7px;font-weight:600;">' + typeLbl + '</span>' +
    '</div>' +
    (rule.description ? '<div style="font-size:13px;color:var(--text);">' + rule.description + '</div>' : '') +
    '<div style="font-size:11px;color:var(--muted);margin-top:3px;">' +
      rule.account + ' &middot; ' + freqLbl +
      ' &middot; Next: <strong style="color:var(--primary)">' + nextDue + '</strong>' +
      (!rule.active ? ' &middot; <span style="color:#f59e0b;font-weight:700">⏸ Paused</span>' : '') +
    '</div>';

  const amt = document.createElement('div');
  amt.style.cssText = 'text-align:right;flex-shrink:0;';
  amt.innerHTML = '<div style="font-size:17px;font-weight:700;color:' + amtCol + ';">' + amtSign + '$' + rule.amount.toFixed(2) + '</div>';

  inner.appendChild(icon);
  inner.appendChild(info);
  inner.appendChild(amt);
  div.appendChild(inner);

  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px;margin-top:10px;';

  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'rec-btn ' + (rule.active ? 'rec-btn-pause' : 'rec-btn-resume');
  pauseBtn.textContent = rule.active ? '⏸ Pause' : '▶ Resume';
  pauseBtn.onclick = function(){ toggleRecurring(rule.id); };

  const delBtn = document.createElement('button');
  delBtn.className = 'rec-btn rec-btn-del';
  delBtn.textContent = '🗑 Delete';
  delBtn.onclick = function(){ deleteRecurring(rule.id); };

  btns.appendChild(pauseBtn);
  btns.appendChild(delBtn);
  div.appendChild(btns);
  return div;
}

function addRecurring(){
  initRecurring();
  const errEl = document.getElementById('rec-err');
  errEl.textContent = '';
  const amt = parseFloat(document.getElementById('rec-amount').value);
  if(!amt || amt <= 0){ errEl.textContent = '⚠️ Enter a valid amount'; return; }
  const cat   = document.getElementById('rec-cat').value;
  const acc   = document.getElementById('rec-acc').value;
  const start = document.getElementById('rec-start').value;
  const desc  = document.getElementById('rec-desc').value.trim();
  const freq  = document.getElementById('rec-freq').value;
  if(!cat)  { errEl.textContent = '⚠️ Select a category'; return; }
  if(!acc)  { errEl.textContent = '⚠️ Select an account'; return; }
  if(!start){ errEl.textContent = '⚠️ Set a start date'; return; }
  const rule = {
    id: 'r_' + Date.now(),
    type: recCurrentType,
    amount: amt,
    category: cat,
    account: acc,
    description: desc,
    frequency: freq,
    startDate: start,
    lastRun: null,
    active: true
  };
  st.recurring.push(rule);
  save();
  document.getElementById('rec-amount').value = '';
  document.getElementById('rec-desc').value   = '';
  processRecurring();  // adds txs to st + calls renderDashboard/renderCalendar if any added
  renderRecurring();
  renderDashboard();    // always refresh dashboard regardless
  if(typeof renderCalendar === 'function') renderCalendar();
  showToast('✅ Recurring rule added');
}

function toggleRecurring(id){
  const rule = st.recurring.find(function(r){ return r.id === id; });
  if(!rule) return;
  rule.active = !rule.active;
  save(); renderRecurringList();
  showToast(rule.active ? '▶ Resumed' : '⏸ Paused');
}

function deleteRecurring(id){
  if(!confirm('Delete this rule? Past transactions will remain.')) return;
  st.recurring = st.recurring.filter(function(r){ return r.id !== id; });
  save(); renderRecurringList();
  showToast('Deleted');
}
