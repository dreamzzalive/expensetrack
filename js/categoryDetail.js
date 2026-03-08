function openCategoryDetail(cat){
  const color=COLORS[(state.categories||[]).indexOf(cat)%COLORS.length];
  const emoji=EMOJIS[cat]||'💳';
  const txs=[...state.transactions].filter(t=>t.category===cat).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total=txs.reduce((s,t)=>s+t.amount,0);
  const avg=txs.length?total/txs.length:0;
  document.getElementById('cat-page-title').textContent=emoji+' '+cat;
  document.getElementById('cat-page-sub').textContent=txs.length+' transaction'+(txs.length!==1?'s':'');
  const card=document.getElementById('cat-page-summary-card');
  card.innerHTML=`<div class="label">Total Spent</div><div class="amount">$${total.toFixed(2)}</div><div class="sub">Avg per transaction: $${avg.toFixed(2)}</div>`;
  card.style.background=`linear-gradient(135deg,${color},${color}bb)`;
  document.getElementById('cat-page-list').innerHTML=txs.length?txs.map(t=>txCard(t,true)).join(''):'<div class="empty-state">No transactions in this category</div>';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-category').classList.add('active');
}