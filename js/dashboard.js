let dashMonth=new Date();dashMonth.setDate(1);
function changeMonth(d){dashMonth.setMonth(dashMonth.getMonth()+d);renderDashboard();}

function renderDashboard(){
  const now=new Date();
  document.getElementById('dash-date').textContent=now.toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('dash-month-label').textContent=dashMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
  const txs=getMonthTxs(dashMonth);
  const incTxs=getMonthIncome(dashMonth);
  const totalExp=txs.reduce((s,t)=>s+t.amount,0);
  const totalInc=incTxs.reduce((s,t)=>s+t.amount,0);
  const net=totalInc-totalExp;

  // Summary cards
  document.getElementById('dash-total-exp').textContent='$'+totalExp.toFixed(2);
  document.getElementById('dash-total-inc').textContent='$'+totalInc.toFixed(2);
  document.getElementById('dash-net').textContent=(net>=0?'+':'')+' $'+Math.abs(net).toFixed(2);
  document.getElementById('dash-net').style.color=net>=0?'#10b981':'#f04a4a';
  document.getElementById('dash-sub').textContent=txs.length+' expense'+(txs.length!==1?'s':'')+' · '+incTxs.length+' income record'+(incTxs.length!==1?'s':'');

  // ── Category bar chart ──
  const bycat={};txs.forEach(t=>{bycat[t.category]=(bycat[t.category]||0)+t.amount;});
  const sortedCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const maxCat=sortedCat.length?sortedCat[0][1]:1;
  const catChartEl=document.getElementById('bar-chart-card');
  catChartEl.innerHTML=sortedCat.length?sortedCat.map(([cat,amt])=>{
    const color=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
    return `<div class="bc-row"><div class="bc-label" title="${cat}">${cat}</div><div class="bc-track"><div class="bc-fill" style="width:${(amt/maxCat*100).toFixed(1)}%;background:${color}"></div></div><div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div></div>`;
  }).join(''):'<div class="empty-state" style="padding:20px">No expenses yet</div>';

  // ── Category clickable list ──
  const catListEl=document.getElementById('cat-summary-list');
  catListEl.innerHTML=sortedCat.length?sortedCat.map(([cat,amt])=>{
    const color=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
    const count=txs.filter(t=>t.category===cat).length;
    return `<div class="cat-bar-item" onclick="openCategoryDetail('${cat}')">
      <div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:${color}"></span>${cat}</div>
      <div style="display:flex;align-items:center;gap:6px;"><div class="cat-bar-amt">$${amt.toFixed(2)}</div><span class="cat-chevron">›</span></div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(amt/maxCat*100).toFixed(0)}%;background:${color}"></div></div>
      <div class="cat-bar-meta">${count} transaction${count!==1?'s':''}</div></div>`;
  }).join(''):'<div class="empty-state">No expenses this month</div>';

  // ── Account bar chart ──
  const byacc={};txs.forEach(t=>{byacc[t.account]=(byacc[t.account]||0)+t.amount;});
  const sortedAcc=Object.entries(byacc).sort((a,b)=>b[1]-a[1]);
  const maxAcc=sortedAcc.length?sortedAcc[0][1]:1;
  const accChartEl=document.getElementById('acc-chart-card');
  accChartEl.innerHTML=sortedAcc.length?sortedAcc.map(([acc,amt])=>{
    const color=ACC_COLORS[(state.accounts||[]).indexOf(acc)%ACC_COLORS.length];
    return `<div class="bc-row"><div class="bc-label" title="${acc}">${acc}</div><div class="bc-track"><div class="bc-fill" style="width:${(amt/maxAcc*100).toFixed(1)}%;background:${color}"></div></div><div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div></div>`;
  }).join(''):'<div class="empty-state" style="padding:20px">No data yet</div>';

  // ── Account clickable list ──
  const accListEl=document.getElementById('acc-summary-list');
  accListEl.innerHTML=sortedAcc.length?sortedAcc.map(([acc,amt])=>{
    const color=ACC_COLORS[(state.accounts||[]).indexOf(acc)%ACC_COLORS.length];
    const count=txs.filter(t=>t.account===acc).length;
    return `<div class="cat-bar-item" onclick="openAccountDetail('${acc}')">
      <div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:${color}"></span>${getAccEmoji(acc)} ${acc}</div>
      <div style="display:flex;align-items:center;gap:6px;"><div class="cat-bar-amt">$${amt.toFixed(2)}</div><span class="cat-chevron">›</span></div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(amt/maxAcc*100).toFixed(0)}%;background:${color}"></div></div>
      <div class="cat-bar-meta">${count} transaction${count!==1?'s':''}</div></div>`;
  }).join(''):'<div class="empty-state">No transactions this month</div>';

  // ── Income bar chart ──
  const byinc={};incTxs.forEach(t=>{byinc[t.category]=(byinc[t.category]||0)+t.amount;});
  const sortedInc=Object.entries(byinc).sort((a,b)=>b[1]-a[1]);
  const maxInc=sortedInc.length?sortedInc[0][1]:1;
  const incChartEl=document.getElementById('inc-chart-card');
  incChartEl.innerHTML=sortedInc.length?sortedInc.map(([cat,amt])=>{
    const color=getIncColor(cat);
    return `<div class="bc-row"><div class="bc-label" title="${cat}">${cat}</div><div class="bc-track"><div class="bc-fill" style="width:${(amt/maxInc*100).toFixed(1)}%;background:${color}"></div></div><div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div></div>`;
  }).join(''):'<div class="empty-state" style="padding:20px">No income yet</div>';

  // ── Income clickable list ──
  const incListEl=document.getElementById('inc-summary-list');
  incListEl.innerHTML=sortedInc.length?sortedInc.map(([cat,amt])=>{
    const color=getIncColor(cat);
    const count=incTxs.filter(t=>t.category===cat).length;
    return `<div class="cat-bar-item" onclick="openIncomeDetail('${cat}')">
      <div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:${color}"></span>${getIncEmoji(cat)} ${cat}</div>
      <div style="display:flex;align-items:center;gap:6px;"><div class="inc-bar-amt" style="color:${color}">$${amt.toFixed(2)}</div><span class="cat-chevron">›</span></div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(amt/maxInc*100).toFixed(0)}%;background:${color}"></div></div>
      <div class="cat-bar-meta">${count} record${count!==1?'s':''}</div></div>`;
  }).join(''):'<div class="empty-state">No income this month</div>';

  // ── Recent ──
  const allRecent=[
    ...state.transactions.map(t=>({...t,_type:'expense'})),
    ...(state.income||[]).map(t=>({...t,_type:'income'}))
  ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
  document.getElementById('recent-list').innerHTML=allRecent.length
    ?allRecent.map(t=>t._type==='income'?incomeCard(t,true):txCard(t,true)).join('')
    :'<div class="empty-state">No transactions yet</div>';
}

function getMonthTxs(d){const y=d.getFullYear(),m=d.getMonth();return state.transactions.filter(t=>{const td=new Date(t.date);return td.getFullYear()===y&&td.getMonth()===m;});}
function getMonthIncome(d){const y=d.getFullYear(),m=d.getMonth();return(state.income||[]).filter(t=>{const td=new Date(t.date);return td.getFullYear()===y&&td.getMonth()===m;});}
