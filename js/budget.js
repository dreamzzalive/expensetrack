// ═══════════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════════

/* budgets stored as st.budgets = { "Food": 500, "Transport": 200, ... } */

function getBudget(cat){ return (st.budgets && st.budgets[cat]) ? st.budgets[cat] : 0; }
function setBudget(cat, amt){
  if(!st.budgets) st.budgets = {};
  if(!amt || amt <= 0) delete st.budgets[cat];
  else st.budgets[cat] = amt;
  save();
}

/* ── Render full budget page ── */
function renderBudget(){
  const now   = new Date();
  const y     = budgetYear, m = budgetMonth;
  const label = new Date(y, m, 1).toLocaleDateString('en-SG', {month:'long', year:'numeric'});
  document.getElementById('budget-month-label').textContent = label;

  const txs    = (st.transactions||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===m; });
  const cats   = st.categories || DEFAULT_CATEGORIES;
  const budgets= st.budgets || {};

  // Summary bar at top
  const totalBudget = Object.values(budgets).reduce((s,v)=>s+v,0);
  const totalSpent  = cats.reduce((s,c)=>s+txs.filter(t=>t.category===c).reduce((a,t)=>a+t.amount,0),0);
  const pct         = totalBudget > 0 ? Math.min((totalSpent/totalBudget)*100,100) : 0;
  const overBudget  = totalBudget > 0 && totalSpent > totalBudget;

  document.getElementById('budget-summary-card').innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
      '<div><div class="label">Total Budget</div><div style="font-size:22px;font-weight:700;color:#fff;margin-top:4px;">$'+totalBudget.toFixed(2)+'</div></div>' +
      '<div style="text-align:right"><div class="label">Total Spent</div><div style="font-size:22px;font-weight:700;color:#fff;margin-top:4px;">$'+totalSpent.toFixed(2)+'</div></div>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,.3);border-radius:99px;height:10px;overflow:hidden;">' +
      '<div style="height:10px;border-radius:99px;background:'+(overBudget?'#fbbf24':'#fff')+';width:'+pct.toFixed(1)+'%;transition:width .4s;"></div>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:8px;">' +
      '<span style="font-size:12px;opacity:.85;">'+(totalBudget>0?pct.toFixed(1)+'% used':'No budgets set')+'</span>' +
      '<span style="font-size:12px;font-weight:700;opacity:.95;">'+(overBudget?'⚠️ Over by $'+(totalSpent-totalBudget).toFixed(2):'$'+(totalBudget-totalSpent).toFixed(2)+' remaining')+'</span>' +
    '</div>';

  // Per-category rows
  const listEl = document.getElementById('budget-cat-list');
  listEl.innerHTML = cats.map(cat => {
    const spent   = txs.filter(t=>t.category===cat).reduce((s,t)=>s+t.amount,0);
    const budget  = getBudget(cat);
    const color   = getCatColor(cat);
    const emoji   = EMOJIS[cat] || '💳';
    const hasBudget = budget > 0;
    const pctUsed   = hasBudget ? Math.min((spent/budget)*100,100) : 0;
    const over      = hasBudget && spent > budget;
    const barColor  = over ? '#f04a4a' : (pctUsed>80 ? '#f59e0b' : color);
    const remaining = hasBudget ? budget - spent : 0;

    return '<div class="budget-cat-card">' +
      // Header row
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<div style="width:36px;height:36px;border-radius:10px;background:'+color+'22;display:flex;align-items:center;justify-content:center;font-size:18px;">'+emoji+'</div>' +
          '<div><div style="font-size:14px;font-weight:700;">'+cat+'</div>' +
          '<div style="font-size:12px;color:var(--muted);">Spent: <strong style="color:'+color+'">$'+spent.toFixed(2)+'</strong></div></div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          (hasBudget
            ? '<div style="font-size:13px;font-weight:700;color:'+(over?'#f04a4a':'var(--text)')+'">$'+budget.toFixed(2)+' budget</div>' +
              '<div style="font-size:11px;color:'+(over?'#f04a4a':remaining<budget*.1?'#f59e0b':'#10b981')+';">'+(over?'⚠️ Over $'+(spent-budget).toFixed(2):'$'+remaining.toFixed(2)+' left')+'</div>'
            : '<div style="font-size:12px;color:var(--muted)">No budget set</div>') +
        '</div>' +
      '</div>' +
      // Progress bar
      (hasBudget
        ? '<div style="background:var(--border);border-radius:99px;height:8px;overflow:hidden;">' +
            '<div style="height:8px;border-radius:99px;background:'+barColor+';width:'+pctUsed.toFixed(1)+'%;transition:width .4s;"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;margin-top:4px;">' +
            '<span style="font-size:10px;color:var(--muted);">0%</span>' +
            '<span style="font-size:11px;font-weight:700;color:'+barColor+';">'+pctUsed.toFixed(0)+'%</span>' +
            '<span style="font-size:10px;color:var(--muted);">100%</span>' +
          '</div>'
        : '<div style="background:var(--border);border-radius:99px;height:8px;"></div>') +
      // Edit budget input
      '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;">' +
        '<div class="amount-input-wrap" style="flex:1;">' +
          '<span class="currency">$</span>' +
          '<input type="number" id="bgt-inp-'+cat.replace(/\s/g,'_')+'" placeholder="Set budget..." value="'+(hasBudget?budget:'')+'" min="0" step="1" inputmode="decimal" style="padding-left:32px!important;padding:10px 10px 10px 32px;font-size:14px;"/>' +
        '</div>' +
        '<button onclick="saveBudgetFor(\''+cat+'\')" style="background:'+color+';color:#fff;border:none;border-radius:8px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer;">Save</button>' +
        (hasBudget ? '<button onclick="clearBudgetFor(\''+cat+'\')" style="background:var(--border);color:var(--muted);border:none;border-radius:8px;padding:10px 10px;font-size:13px;cursor:pointer;">✕</button>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function saveBudgetFor(cat){
  const id  = 'bgt-inp-'+cat.replace(/\s/g,'_');
  const val = parseFloat(document.getElementById(id).value);
  if(isNaN(val)||val<0){ showToast('⚠️ Enter a valid amount'); return; }
  setBudget(cat, val);
  renderBudget();
  showToast('✅ Budget saved for '+cat);
}
function clearBudgetFor(cat){
  setBudget(cat, 0);
  renderBudget();
  showToast('Budget cleared for '+cat);
}

let budgetYear  = new Date().getFullYear();
let budgetMonth = new Date().getMonth();
function budgetChangeMonth(d){
  budgetMonth += d;
  if(budgetMonth > 11){ budgetMonth = 0; budgetYear++; }
  if(budgetMonth < 0) { budgetMonth = 11; budgetYear--; }
  renderBudget();
}
