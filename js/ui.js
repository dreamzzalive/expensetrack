function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function renderSyncBanner(){const wrap=document.getElementById('sync-banner-wrap');if(currentUser){wrap.innerHTML='';return;}if(!FIREBASE_READY){wrap.innerHTML=`<div class="sync-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg><div class="sync-banner-text"><strong>Demo Mode</strong>Add Firebase config to enable cloud sync.</div></div>`;}else{wrap.innerHTML=`<div class="sync-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg><div class="sync-banner-text"><strong>Not signed in</strong>Sign in to sync across all devices.</div><button onclick="openAuthModal()">Sign In</button></div>`;}}
function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  if(btn)btn.classList.add('active');
  const actions={dashboard:renderDashboard,add:populateFormSelects,calendar:renderCalendar,analytics:renderAnalytics,settings:renderSettings};
  if(actions[name])actions[name]();
}
function txCard(t,showDelete=true){
  const color=COLORS[(state.categories||[]).indexOf(t.category)%COLORS.length];
  const emoji=EMOJIS[t.category]||'💳';
  const desc=t.description?`<div class="tx-desc">${t.description}</div>`:'';
  return `<div class="tx-item">
    <div class="tx-icon" style="background:${color}22">${emoji}</div>
    <div class="tx-info">
      <div class="tx-cat" style="color:${color}">${t.category}</div>
      ${desc}
      <div class="tx-meta">${t.account} · ${t.date}</div>
    </div>
    <div class="tx-amt">$${t.amount.toFixed(2)}</div>
    ${showDelete?`<button class="tx-del" onclick="deleteTx('${t.id}')">✕</button>`:''}
  </div>`;
}
function deleteTx(id){state.transactions=state.transactions.filter(t=>t.id!==id);saveState();renderDashboard();renderCalTxList();showToast('Deleted');}