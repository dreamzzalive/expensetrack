// ═══════════════════════════════════════════════════════════════
// CSV
// ═══════════════════════════════════════════════════════════════

// Staged rows waiting for confirmation
let csvStagedRows = [];
let csvFileName   = '';

/* ── Step 1: Parse file, show preview, wait for confirmation ── */
function importCSV(e){
  const file = e.target.files[0];
  if(!file) return;
  csvFileName = file.name;
  const reader = new FileReader();
  reader.onload = function(ev){
    const raw   = ev.target.result.split('\n').filter(function(l){ return l.trim(); });
    const rows  = [];
    const errors= [];
    raw.forEach(function(line, i){
      // Skip header row
      if(i===0 && line.toLowerCase().includes('date')) return;
      const p    = parseCSVLine(line);
      const date = p[0], desc = p[1], amount = p[2], cat = p[3], acc = p[4],
            type = (p[5]||'').toLowerCase().trim(),
            toAcc= p[6]||'',   // for transfers
            isRec= (p[7]||'').toLowerCase().trim(); // 'yes'/'true' = recurring

      const amt = parseFloat(amount);
      if(!date || isNaN(amt) || amt <= 0){ errors.push('Row '+(i+1)+': invalid date or amount'); return; }

      // Determine type
      const txType = type === 'income' ? 'income'
                   : type === 'transfer' ? 'transfer'
                   : 'expense';

      rows.push({ date, desc: desc||'', amt, cat, acc, type: txType,
                  toAcc: toAcc.trim(), recurring: isRec === 'yes' || isRec === 'true' });
    });

    csvStagedRows = rows;
    showCSVPreview(rows, errors);
  };
  reader.readAsText(file);
  // Reset input so same file can be re-uploaded
  e.target.value = '';
}

function parseCSVLine(line){
  const result = [];
  let cur = '', inQ = false;
  for(let i = 0; i < line.length; i++){
    const c = line[i];
    if(c === '"'){ inQ = !inQ; }
    else if(c === ',' && !inQ){ result.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  result.push(cur.trim());
  return result;
}

/* ── Step 2: Show confirmation preview modal ── */
function showCSVPreview(rows, errors){
  const statusEl = document.getElementById('csv-status');

  // Count by type
  const nExp  = rows.filter(function(r){ return r.type==='expense'; }).length;
  const nInc  = rows.filter(function(r){ return r.type==='income'; }).length;
  const nTr   = rows.filter(function(r){ return r.type==='transfer'; }).length;
  const nRec  = rows.filter(function(r){ return r.recurring; }).length;

  // Build preview table (first 8 rows)
  const preview = rows.slice(0,8);
  const tableRows = preview.map(function(r){
    const typeLabel = r.type==='income'   ? '<span style="color:#10b981;font-weight:700">Income</span>'
                    : r.type==='transfer' ? '<span style="color:#0ea5e9;font-weight:700">Transfer</span>'
                    : '<span style="color:#f04a4a;font-weight:700">Expense</span>';
    const recBadge = r.recurring ? ' 🔁' : '';
    return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:6px 4px;font-size:12px;">'+r.date+'</td>' +
      '<td style="padding:6px 4px;font-size:12px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+r.desc+recBadge+'</td>' +
      '<td style="padding:6px 4px;font-size:12px;text-align:right;">$'+r.amt.toFixed(2)+'</td>' +
      '<td style="padding:6px 4px;font-size:12px;">'+r.cat+'</td>' +
      '<td style="padding:6px 4px;font-size:12px;">'+typeLabel+'</td>' +
    '</tr>';
  }).join('');

  const moreNote = rows.length > 8 ? '<div style="font-size:12px;color:var(--muted);padding:8px 0;">...and '+(rows.length-8)+' more rows</div>' : '';

  statusEl.innerHTML =
    '<div style="background:var(--card);border-radius:var(--r);padding:16px;box-shadow:var(--sh);margin-top:10px;">' +
      // Summary
      '<div style="font-size:14px;font-weight:700;margin-bottom:10px;">📂 '+csvFileName+'</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">' +
        '<span style="background:#fde8e8;color:#f04a4a;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">💸 '+nExp+' Expenses</span>' +
        '<span style="background:#d1fae5;color:#10b981;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">💰 '+nInc+' Income</span>' +
        (nTr  ? '<span style="background:#e0f2fe;color:#0ea5e9;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">🔄 '+nTr+' Transfers</span>' : '') +
        (nRec ? '<span style="background:#ede9fe;color:#8b5cf6;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">🔁 '+nRec+' Recurring</span>' : '') +
        (errors.length ? '<span style="background:#fef3c7;color:#92400e;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">⚠️ '+errors.length+' Skipped</span>' : '') +
      '</div>' +
      // Preview table
      '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;">' +
          '<thead><tr style="border-bottom:2px solid var(--border);">' +
            '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Date</th>' +
            '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Description</th>' +
            '<th style="padding:6px 4px;font-size:11px;text-align:right;color:var(--muted);">Amount</th>' +
            '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Category</th>' +
            '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Type</th>' +
          '</tr></thead>' +
          '<tbody>'+tableRows+'</tbody>' +
        '</table>' +
      '</div>' +
      moreNote +
      // Confirm / Cancel buttons
      '<div style="display:flex;gap:10px;margin-top:14px;">' +
        '<button onclick="confirmCSVImport()" class="btn-primary" style="flex:1;">✅ Import '+rows.length+' rows</button>' +
        '<button onclick="cancelCSVImport()" style="flex:0 0 auto;background:var(--border);color:var(--text);border:none;border-radius:var(--rs);padding:12px 16px;font-weight:700;cursor:pointer;">Cancel</button>' +
      '</div>' +
    '</div>';
}

/* ── Step 3: User confirms — actually import ── */
function confirmCSVImport(){
  let imp = 0;
  const accs = st.accounts || DEFAULT_ACCOUNTS;
  const cats = st.categories || DEFAULT_CATEGORIES;
  const incCats = st.incomeCategories || DEFAULT_INCOME_CATEGORIES;

  csvStagedRows.forEach(function(r){
    if(r.type === 'transfer'){
      // Transfer row
      const fromAcc = accs.includes(r.acc)   ? r.acc   : accs[0];
      const toAcc   = accs.includes(r.toAcc) ? r.toAcc : (accs.length > 1 ? accs[1] : accs[0]);
      if(!st.transfers) st.transfers = [];
      st.transfers.push({
        id:          'tr_csv_'+Date.now()+'_'+Math.random().toString(36).slice(2),
        amount:      r.amt,
        description: r.desc,
        date:        r.date,
        from:        fromAcc,
        to:          toAcc,
        notes:       r.recurring ? 'Recurring' : ''
      });
    } else if(r.type === 'income'){
      if(!st.income) st.income = [];
      st.income.push({
        id:          'inc_csv_'+Date.now()+'_'+Math.random().toString(36).slice(2),
        amount:      r.amt,
        description: r.desc,
        date:        r.date,
        category:    incCats.includes(r.cat) ? r.cat : incCats[0],
        account:     accs.includes(r.acc) ? r.acc : accs[0],
        notes:       r.recurring ? 'Recurring' : ''
      });
    } else {
      st.transactions.push({
        id:          'exp_csv_'+Date.now()+'_'+Math.random().toString(36).slice(2),
        amount:      r.amt,
        description: r.desc,
        date:        r.date,
        category:    cats.includes(r.cat) ? r.cat : cats[0],
        account:     accs.includes(r.acc) ? r.acc : accs[0],
        notes:       r.recurring ? 'Recurring' : ''
      });
    }
    imp++;
  });

  save();
  renderDashboard();
  if(typeof renderCalendar === 'function') renderCalendar();
  csvStagedRows = [];

  document.getElementById('csv-status').innerHTML =
    '<div style="background:#d1fae5;color:#065f46;border-radius:var(--rs);padding:12px;font-weight:700;font-size:14px;">✅ Successfully imported '+imp+' rows</div>';
  showToast('✅ Imported '+imp+' records');
}

function cancelCSVImport(){
  csvStagedRows = [];
  document.getElementById('csv-status').innerHTML =
    '<div style="color:var(--muted);font-size:13px;">Import cancelled.</div>';
}

/* ── Export ── */
function exportCSV(){
  const rows = [['date','description','amount','category','account','type','to_account','recurring']];
  [...st.transactions].sort(function(a,b){ return new Date(a.date)-new Date(b.date); }).forEach(function(t){
    rows.push([t.date, t.description||'', t.amount, t.category, t.account, 'expense', '', t.recurringId?'yes':'no']);
  });
  [...(st.income||[])].sort(function(a,b){ return new Date(a.date)-new Date(b.date); }).forEach(function(t){
    rows.push([t.date, t.description||'', t.amount, t.category, t.account, 'income', '', t.recurringId?'yes':'no']);
  });
  [...(st.transfers||[])].sort(function(a,b){ return new Date(a.date)-new Date(b.date); }).forEach(function(t){
    rows.push([t.date, t.description||'', t.amount, 'Transfer', t.from, 'transfer', t.to, 'no']);
  });
  const csv = rows.map(function(r){
    return r.map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }).join(',');
  }).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'expensetrack_export.csv';
  a.click();
  showToast('✅ Exported');
}
