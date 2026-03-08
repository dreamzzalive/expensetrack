function openAccountDetail(acc){
  const color = getAccColor(acc);
  const emoji = getAccEmoji(acc);
  const txs   = [...state.transactions].filter(t=>t.account===acc).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total = txs.reduce((s,t)=>s+t.amount,0);
  const avg   = txs.length ? total/txs.length : 0;

  // Header
  document.getElementById('acc-page-title').textContent = emoji+' '+acc;
  document.getElementById('acc-page-sub').textContent   = txs.length+' transaction'+(txs.length!==1?'s':'');

  // Summary card
  const card = document.getElementById('acc-page-summary-card');
  card.innerHTML = `<div class="label">Total Spent</div>
    <div class="amount">$${total.toFixed(2)}</div>
    <div class="sub">Avg per transaction: $${avg.toFixed(2)} &nbsp;·&nbsp; ${txs.length} transactions</div>`;
  card.style.background = `linear-gradient(135deg,${color},${color}bb)`;

  // Category split bar chart for this account
  const bycat={};
  txs.forEach(t=>{bycat[t.category]=(bycat[t.category]||0)+t.amount;});
  const sortedCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  renderBarChart('acc-page-cat-chart', sortedCat, cat=>COLORS[(state.categories||[]).indexOf(cat)%COLORS.length]);

  // Transaction list
  document.getElementById('acc-page-list').innerHTML = txs.length
    ? txs.map(t=>txCard(t,true)).join('')
    : '<div class="empty-state">No transactions for this account</div>';

  // Navigate to account page
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-account').classList.add('active');
}