// ═══════════════════════════════════════════════════════════════
// DETAIL PAGES
// ═══════════════════════════════════════════════════════════════
function openCatDetail(cat){
  const color=getCatColor(cat); const txs=[...st.transactions].filter(t=>t.category===cat).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total=txs.reduce((s,t)=>s+t.amount,0); const avg=txs.length?total/txs.length:0;
  document.getElementById('cat-page-title').textContent=(EMOJIS[cat]||'💳')+' '+cat;
  document.getElementById('cat-page-sub').textContent=txs.length+' transaction'+(txs.length!==1?'s':'');
  const card=document.getElementById('cat-page-card'); card.style.background='linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML='<div class="label">Total Spent</div><div class="amount">$'+total.toFixed(2)+'</div><div style="font-size:13px;opacity:.85;margin-top:4px;">Avg $'+avg.toFixed(2)+' per transaction</div>';
  document.getElementById('cat-page-list').innerHTML=txs.map(t=>txCard(t,true)).join('')||'<div class="empty-state">No transactions</div>';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-category').classList.add('active');
}
function openAccDetail(acc){
  const color=getAccColor(acc); const txs=[...st.transactions].filter(t=>t.account===acc).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const trsIn=(st.transfers||[]).filter(t=>t.to===acc); const trsOut=(st.transfers||[]).filter(t=>t.from===acc);
  const totalExp=txs.reduce((s,t)=>s+t.amount,0); const totalIn=trsIn.reduce((s,t)=>s+t.amount,0);
  const outstanding=Math.max(0,totalExp-totalIn);
  document.getElementById('acc-page-title').textContent=getAccEmoji(acc)+' '+acc;
  document.getElementById('acc-page-sub').textContent=txs.length+' expenses · '+trsIn.length+' payments received';
  const card=document.getElementById('acc-page-card'); card.style.background='linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;"><div><div class="label">Total Charged</div><div class="amount">$'+totalExp.toFixed(2)+'</div></div><div><div class="label">Payments In</div><div class="amount">$'+totalIn.toFixed(2)+'</div></div></div><div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;opacity:.85;">Outstanding</span><span style="font-size:22px;font-weight:700;">'+(outstanding>0?'$'+outstanding.toFixed(2):'✅ Cleared')+'</span></div>';
  const catE=byKey(txs,'category'); barChart(document.getElementById('acc-page-cat-chart'),catE,getCatColor);
  const allTr=(st.transfers||[]).filter(t=>t.from===acc||t.to===acc).sort((a,b)=>new Date(b.date)-new Date(a.date));
  document.getElementById('acc-page-transfers').innerHTML=allTr.map(t=>trCard(t)).join('')||'<div class="empty-state" style="padding:16px">No transfers</div>';
  document.getElementById('acc-page-list').innerHTML=txs.map(t=>txCard(t,true)).join('')||'<div class="empty-state">No expenses</div>';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-account').classList.add('active');
}
function openIncDetail(cat){
  const color=getIncColor(cat); const txs=[...(st.income||[])].filter(t=>t.category===cat).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total=txs.reduce((s,t)=>s+t.amount,0); const avg=txs.length?total/txs.length:0;
  document.getElementById('inc-page-title').textContent=getIncEmoji(cat)+' '+cat;
  document.getElementById('inc-page-sub').textContent=txs.length+' record'+(txs.length!==1?'s':'');
  const card=document.getElementById('inc-page-card'); card.style.background='linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML='<div class="label">Total Income</div><div class="amount">$'+total.toFixed(2)+'</div><div style="font-size:13px;opacity:.85;margin-top:4px;">Avg $'+avg.toFixed(2)+' per record</div>';
  document.getElementById('inc-page-list').innerHTML=txs.map(t=>incCard(t,true)).join('')||'<div class="empty-state">No records</div>';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-income').classList.add('active');
}