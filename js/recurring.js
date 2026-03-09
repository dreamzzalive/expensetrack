// ═══════════════════════════════════════════════════════════════
// RECURRING TRANSACTIONS
// ═══════════════════════════════════════════════════════════════
// st.recurring = [ { id, type('expense'/'income'), amount, category, account,
//                    description, frequency('daily'/'weekly'/'monthly'/'yearly'),
//                    startDate, lastRun, active } ]

function initRecurring(){
  if(!st.recurring) st.recurring = [];
}

/* ── Run due recurring transactions (called on app load + daily) ── */
function processRecurring(){
  initRecurring();
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = toDateStr(today);
  let added = 0;

  st.recurring.forEach(rule => {
    if(!rule.active) return;
    let next = getNextDue(rule);
    // Keep generating until next due date is in the future
    while(next <= today){
      const dateStr = toDateStr(next);
      // Avoid exact duplicates (same rule, same date)
      const alreadyExists = (rule.type === 'income'
        ? (st.income||[])
        : st.transactions
      ).some(t => t.recurringId === rule.id && t.date === dateStr);

      if(!alreadyExists){
        const tx = {
          id:          'rec_' + rule.id + '_' + dateStr + '_' + Date.now(),
          amount:      rule.amount,
          description: rule.description || rule.category,
          date:        dateStr,
          category:    rule.category,
          account:     rule.account,
          notes:       '🔁 Recurring',
          recurringId: rule.id
        };
        if(rule.type === 'income'){
          if(!st.income) st.income = [];
          st.income.push(tx);
        } else {
          st.transactions.push(tx);
        }
        added++;
      }
      rule.lastRun = dateStr;
      // Advance to next occurrence
      next = advanceDate(next, rule.frequency);
    }
  });

  if(added > 0){ save(); showToast('🔁 ' + added + ' recurring transaction'+(added>1?'s':'')+' added'); }
}

function toDateStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

function getNextDue(rule){
  if(!rule.lastRun) return parseDate(rule.startDate);
  return advanceDate(parseDate(rule.lastRun), rule.frequency);
}

function parseDate(str){
  const d = new Date(str + 'T00:00:00'); return d;
}

function advanceDate(d, freq){
  const n = new Date(d);
  if(freq === 'daily')   n.setDate(n.getDate()+1);
  if(freq === 'weekly')  n.setDate(n.getDate()+7);
  if(freq === 'monthly') n.setMonth(n.getMonth()+1);
  if(freq === 'yearly')  n.setFullYear(n.getFullYear()+1);
  return n;
}

/* ── Render recurring page ── */
function renderRecurring(){
  initRecurring();
  populateRecurringForm();
  const list = document.getElementById('recurring-list');
  if(!list) return;

  if(!st.recurring.length){
    list.innerHTML = '<div class="empty-state">No recurring transactions yet.<br>Add one below to get started.</div>';
    return;
  }

  list.innerHTML = st.recurring.map(rule => {
    const color   = rule.type==='income' ? getIncColor(rule.category) : getCatColor(rule.category);
    const emoji   = rule.type==='income' ? getIncEmoji(rule.category) : (EMOJIS[rule.category]||'💳');
    const freqLabel = {daily:'Daily',weekly:'Weekly',monthly:'Monthly',yearly:'Yearly'}[rule.frequency];
    const nextDue = toDateStr(getNextDue(rule));
    const amtColor = rule.type==='income' ? '#10b981' : '#f04a4a';
    const amtSign  = rule.type==='income' ? '+' : '-';

    return '<div class="rec-card '+(rule.active?'':'rec-card-paused')+'">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div class="tx-icon" style="background:'+color+'22;width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">'+emoji+'</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:14px;font-weight:700;color:'+color+';">'+rule.category+'</div>' +
          '<div style="font-size:13px;color:var(--text);">'+( rule.description||'')+'</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+rule.account+' · '+freqLabel+
            ' · Next: <strong style="color:var(--primary)">'+nextDue+'</strong>'+
            (!rule.active ? ' · <span style="color:#f59e0b;font-weight:700">Paused</span>' : '')+
          '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0;">' +
          '<div style="font-size:16px;font-weight:700;color:'+amtColor+';">'+amtSign+'$'+rule.amount.toFixed(2)+'</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;">' +
        '<button onclick="toggleRecurring(''+rule.id+'')" class="rec-btn '+(rule.active?'rec-btn-pause':'rec-btn-resume')+'">'+(rule.active?'⏸ Pause':'▶ Resume')+'</button>' +
        '<button onclick="deleteRecurring(''+rule.id+'')" class="rec-btn rec-btn-del">🗑 Delete</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function populateRecurringForm(type){
  const catSel = document.getElementById('rec-cat');
  const accSel = document.getElementById('rec-acc');
  if(!catSel || !accSel) return;
  // If type not passed, detect from active tab
  if(!type){
    const expBtn = document.getElementById('rec-type-exp');
    type = (expBtn && expBtn.classList.contains('active')) ? 'expense' : 'income';
  }
  const cats = type==='income'
    ? (st.incomeCategories||DEFAULT_INCOME_CATEGORIES)
    : (st.categories||DEFAULT_CATEGORIES);
  catSel.innerHTML = cats.map(c=>'<option>'+c+'</option>').join('');
  // Always populate accounts from configured list
  accSel.innerHTML = (st.accounts||DEFAULT_ACCOUNTS).map(a=>'<option>'+a+'</option>').join('');
  // Set today as default start date if empty
  if(!document.getElementById('rec-start').value){
    document.getElementById('rec-start').value = toDateStr(new Date());
  }
}

function switchRecType(type, btn){
  document.querySelectorAll('.rec-type-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  populateRecurringForm(type);
}

function addRecurring(){
  initRecurring();
  const amt   = parseFloat(document.getElementById('rec-amount').value);
  const errEl = document.getElementById('rec-err');
  errEl.textContent = '';
  if(!amt || amt<=0){ errEl.textContent='⚠️ Enter a valid amount'; return; }
  const expBtn = document.getElementById('rec-type-exp');
  const type   = (expBtn && expBtn.classList.contains('active')) ? 'expense' : 'income';
  const rule  = {
    id:          'r_'+Date.now(),
    type,
    amount:      amt,
    category:    document.getElementById('rec-cat').value,
    account:     document.getElementById('rec-acc').value,
    description: document.getElementById('rec-desc').value.trim(),
    frequency:   document.getElementById('rec-freq').value,
    startDate:   document.getElementById('rec-start').value,
    lastRun:     null,
    active:      true
  };
  st.recurring.push(rule);
  save();
  // Reset form
  document.getElementById('rec-amount').value = '';
  document.getElementById('rec-desc').value   = '';
  errEl.textContent = '';
  // Process immediately in case start date is today or past
  processRecurring();
  renderRecurring();
  renderDashboard();
  showToast('✅ Recurring rule added');
}

function toggleRecurring(id){
  const rule = st.recurring.find(r=>r.id===id);
  if(!rule) return;
  rule.active = !rule.active;
  save(); renderRecurring();
  showToast(rule.active ? '▶ Resumed' : '⏸ Paused');
}

function deleteRecurring(id){
  if(!confirm('Delete this recurring rule? Past transactions it created will remain.')) return;
  st.recurring = st.recurring.filter(r=>r.id!==id);
  save(); renderRecurring();
  showToast('Deleted');
}