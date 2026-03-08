function openAccountDetail(acc){
  const color = ACC_COLORS[(state.accounts||[]).indexOf(acc)%ACC_COLORS.length];
  const emoji = ACC_EMOJIS[acc]||'💳';
  const txs   = [...state.transactions].filter(t=>t.account===acc).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const incTxs= (state.income||[]).filter(t=>t.account===acc);
  const trsIn = (state.transfers||[]).filter(t=>t.to===acc);
  const trsOut= (state.transfers||[]).filter(t=>t.from===acc);

  const totalExp  = txs.reduce((s,t)=>s+t.amount,0);
  const totalInc  = incTxs.reduce((s,t)=>s+t.amount,0);
  const totalIn   = trsIn.reduce((s,t)=>s+t.amount,0);
  const totalOut  = trsOut.reduce((s,t)=>s+t.amount,0);
  const outstanding = Math.max(0, totalExp - totalIn);

  document.getElementById('acc-page-title').textContent = emoji+' '+acc;
  document.getElementById('acc-page-sub').textContent   = txs.length+' expense'+(txs.length!==1?'s':'')+' · '+trsIn.length+' payment'+(trsIn.length!==1?'s')+' received';

  const card = document.getElementById('acc-page-summary-card');
  card.style.background = `linear-gradient(135deg,${color},${color}bb)`;
  card.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div><div class="label">Total Charged</div><div style="font-size:20px;font-weight:700;color:white;margin-top:4px;">$${totalExp.toFixed(2)}</div></div>
      <div><div class="label">Payments Received</div><div style="font-size:20px;font-weight:700;color:white;margin-top:4px;">$${totalIn.toFixed(2)}</div></div>
      ${totalInc>0?`<div><div class="label">Income Received</div><div style="font-size:20px;font-weight:700;color:white;margin-top:4px;">$${totalInc.toFixed(2)}</div></div>`:''}
      ${totalOut>0?`<div><div class="label">Transferred Out</div><div style="font-size:20px;font-weight:700;color:white;margin-top:4px;">$${totalOut.toFixed(2)}</div></div>`:''}
    </div>
    <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;opacity:.85;">Outstanding Balance</span>
      <span style="font-size:22px;font-weight:700;">${outstanding>0?'$'+outstanding.toFixed(2):'✅ Cleared'}</span>
    </div>`;

  // Category split bar chart
  const bycat={};
  txs.forEach(t=>{bycat[t.category]=(bycat[t.category]||0)+t.amount;});
  const sortedCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const maxC=sortedCat.length?sortedCat[0][1]:1;
  const catChartEl=document.getElementById('acc-page-cat-chart');
  catChartEl.innerHTML=sortedCat.length?sortedCat.map(([cat,amt])=>{
    const c=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
    return `<div class="bc-row"><div class="bc-label">${cat}</div><div class="bc-track"><div class="bc-fill" style="width:${(amt/maxC*100).toFixed(1)}%;background:${c}"></div></div><div class="bc-amt" style="color:${c}">$${amt.toFixed(0)}</div></div>`;
  }).join(''):'<div class="empty-state" style="padding:16px">No expenses</div>';

  // Transfer history
  const allTr=(state.transfers||[]).filter(t=>t.from===acc||t.to===acc).sort((a,b)=>new Date(b.date)-new Date(a.date));
  document.getElementById('acc-page-transfers').innerHTML=allTr.length
    ?allTr.map(t=>transferCard(t)).join('')
    :'<div class="empty-state" style="padding:16px">No transfers yet</div>';

  // Expense list
  document.getElementById('acc-page-list').innerHTML = txs.length
    ? txs.map(t=>txCard(t,true)).join('')
    : '<div class="empty-state">No expenses for this account</div>';

  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-account').classList.add('active');
}
