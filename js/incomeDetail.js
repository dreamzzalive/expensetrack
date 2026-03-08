function incomeCard(t,showDelete=true){
  const color=getIncColor(t.category);
  const emoji=getIncEmoji(t.category);
  const desc=t.description?`<div class="tx-desc">${t.description}</div>`:'';
  return `<div class="tx-item">
    <div class="tx-icon" style="background:${color}22">${emoji}</div>
    <div class="tx-info">
      <div class="tx-cat" style="color:${color}">${t.category}</div>
      ${desc}
      <div class="tx-meta">${t.account} · ${t.date}</div>
    </div>
    <div class="tx-amt" style="color:#10b981">+$${t.amount.toFixed(2)}</div>
    ${showDelete?`<button class="tx-del" onclick="deleteIncome('${t.id}')">✕</button>`:''}
  </div>`;
}

function deleteIncome(id){
  state.income=(state.income||[]).filter(t=>t.id!==id);
  saveState();renderDashboard();showToast('Deleted');
  // refresh income detail page if open
  const pg=document.getElementById('page-income');
  if(pg&&pg.classList.contains('active')){
    const title=document.getElementById('inc-page-title').textContent.replace(/.*? /,'').trim();
    openIncomeDetail(title);
  }
}

function openIncomeDetail(cat){
  const color=getIncColor(cat);
  const emoji=getIncEmoji(cat);
  const txs=[...(state.income||[])].filter(t=>t.category===cat).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total=txs.reduce((s,t)=>s+t.amount,0);
  const avg=txs.length?total/txs.length:0;
  document.getElementById('inc-page-title').textContent=emoji+' '+cat;
  document.getElementById('inc-page-sub').textContent=txs.length+' record'+(txs.length!==1?'s':'');
  const card=document.getElementById('inc-page-summary-card');
  card.innerHTML=`<div class="label">Total Income</div><div class="amount">$${total.toFixed(2)}</div><div class="sub">Avg per record: $${avg.toFixed(2)}</div>`;
  card.style.background=`linear-gradient(135deg,${color},${color}bb)`;
  document.getElementById('inc-page-list').innerHTML=txs.length
    ?txs.map(t=>incomeCard(t,true)).join('')
    :'<div class="empty-state">No records in this category</div>';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-income').classList.add('active');
}
