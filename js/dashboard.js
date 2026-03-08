let dashMonth=new Date();dashMonth.setDate(1);
function changeMonth(d){dashMonth.setMonth(dashMonth.getMonth()+d);renderDashboard();}

function renderDashboard(){
  const now=new Date();
  document.getElementById('dash-date').textContent=now.toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('dash-month-label').textContent=dashMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
  const txs=getMonthTxs(dashMonth);
  const total=txs.reduce((s,t)=>s+t.amount,0);
  document.getElementById('dash-total').textContent='$'+total.toFixed(2);
  document.getElementById('dash-sub').textContent=txs.length+' transaction'+(txs.length!==1?'s':'')+' this month';

  // ── CATEGORY BAR CHART ──────────────────────────────────────────────────────
  const bycat={};
  txs.forEach(t=>{bycat[t.category]=(bycat[t.category]||0)+t.amount;});
  const sortedCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const maxCat=sortedCat.length?sortedCat[0][1]:1;

  const catChartEl=document.getElementById('bar-chart-card');
  catChartEl.innerHTML=sortedCat.length
    ? sortedCat.map(([cat,amt])=>{
        const color=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
        const pct=(amt/maxCat*100).toFixed(1);
        return `<div class="bc-row">
          <div class="bc-label" title="${cat}">${cat}</div>
          <div class="bc-track"><div class="bc-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div>
        </div>`;
      }).join('')
    : '<div class="empty-state" style="padding:20px">No data yet</div>';

  // ── CATEGORY CLICKABLE LIST ─────────────────────────────────────────────────
  const catListEl=document.getElementById('cat-summary-list');
  catListEl.innerHTML=sortedCat.length
    ? sortedCat.map(([cat,amt])=>{
        const color=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
        const count=txs.filter(t=>t.category===cat).length;
        return `<div class="cat-bar-item" onclick="openCategoryDetail('${cat}')">
          <div class="cat-bar-row">
            <div class="cat-bar-name"><span class="cat-dot" style="background:${color}"></span>${cat}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="cat-bar-amt">$${amt.toFixed(2)}</div>
              <span class="cat-chevron">›</span>
            </div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${(amt/maxCat*100).toFixed(0)}%;background:${color}"></div></div>
          <div class="cat-bar-meta">${count} transaction${count!==1?'s':''}</div>
        </div>`;
      }).join('')
    : '<div class="empty-state">No transactions this month</div>';

  // ── ACCOUNT BAR CHART ───────────────────────────────────────────────────────
  const byacc={};
  txs.forEach(t=>{byacc[t.account]=(byacc[t.account]||0)+t.amount;});
  const sortedAcc=Object.entries(byacc).sort((a,b)=>b[1]-a[1]);
  const maxAcc=sortedAcc.length?sortedAcc[0][1]:1;

  const accChartEl=document.getElementById('acc-chart-card');
  accChartEl.innerHTML=sortedAcc.length
    ? sortedAcc.map(([acc,amt])=>{
        const color=ACC_COLORS[(state.accounts||[]).indexOf(acc)%ACC_COLORS.length];
        const pct=(amt/maxAcc*100).toFixed(1);
        return `<div class="bc-row">
          <div class="bc-label" title="${acc}">${acc}</div>
          <div class="bc-track"><div class="bc-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div>
        </div>`;
      }).join('')
    : '<div class="empty-state" style="padding:20px">No data yet</div>';

  // ── ACCOUNT CLICKABLE LIST ──────────────────────────────────────────────────
  const accListEl=document.getElementById('acc-summary-list');
  accListEl.innerHTML=sortedAcc.length
    ? sortedAcc.map(([acc,amt])=>{
        const color=ACC_COLORS[(state.accounts||[]).indexOf(acc)%ACC_COLORS.length];
        const count=txs.filter(t=>t.account===acc).length;
        const emoji=ACC_EMOJIS[acc]||'💳';
        return `<div class="cat-bar-item" onclick="openAccountDetail('${acc}')">
          <div class="cat-bar-row">
            <div class="cat-bar-name"><span class="cat-dot" style="background:${color}"></span>${emoji} ${acc}</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="cat-bar-amt">$${amt.toFixed(2)}</div>
              <span class="cat-chevron">›</span>
            </div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${(amt/maxAcc*100).toFixed(0)}%;background:${color}"></div></div>
          <div class="cat-bar-meta">${count} transaction${count!==1?'s':''}</div>
        </div>`;
      }).join('')
    : '<div class="empty-state">No transactions this month</div>';

  // ── RECENT TRANSACTIONS ─────────────────────────────────────────────────────
  const recent=[...state.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  document.getElementById('recent-list').innerHTML=recent.length
    ? recent.map(t=>txCard(t,true)).join('')
    : '<div class="empty-state">No transactions yet</div>';
}

function getMonthTxs(d){
  const y=d.getFullYear(),m=d.getMonth();
  return state.transactions.filter(t=>{const td=new Date(t.date);return td.getFullYear()===y&&td.getMonth()===m;});
}
