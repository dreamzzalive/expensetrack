function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function renderSyncBanner(){
  const wrap=document.getElementById('sync-banner-wrap');
  if(!wrap)return;
  if(currentUser){
    wrap.innerHTML='';  // clean — user info is in settings
    return;
  }
  if(!FIREBASE_READY){
    wrap.innerHTML='<div class="sync-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg><div class="sync-banner-text"><strong>Demo Mode</strong>Add Firebase config to enable cloud sync & multi-device access.</div></div>';
  }
}if(!FIREBASE_READY){wrap.innerHTML=`<div class="sync-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg><div class="sync-banner-text"><strong>Demo Mode</strong>Add Firebase config to enable cloud sync.</div></div>`;}else{wrap.innerHTML=`<div class="sync-banner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg><div class="sync-banner-text"><strong>Not signed in</strong>Sign in to sync across all devices.</div><button onclick="openAuthModal()">Sign In</button></div>`;}}
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

/** Reusable horizontal bar chart renderer */
function renderBarChart(containerId, entries, colorFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!entries.length) { el.innerHTML = '<div class="empty-state" style="padding:20px">No data yet</div>'; return; }
  const max = entries[0][1];
  el.innerHTML = entries.map(([label, amt]) => {
    const color = colorFn(label);
    return `<div class="bc-row">
      <div class="bc-label" title="${label}">${label}</div>
      <div class="bc-track"><div class="bc-fill" style="width:${(amt/max*100).toFixed(1)}%;background:${color}"></div></div>
      <div class="bc-amt" style="color:${color}">$${amt.toFixed(0)}</div>
    </div>`;
  }).join('');
}

/** Reusable donut chart renderer */
function renderDonutChart(svgId, legendId, entries, total, colorFn) {
  const r=60,cx=75,cy=75,stroke=22,circ=2*Math.PI*r;
  let offset=0,paths='';
  entries.forEach(([label,amt])=>{
    const color=colorFn(label);const dash=amt/total*circ;
    paths+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${circ-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset+=dash;
  });
  if(!entries.length)paths=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e8eaf0" stroke-width="${stroke}"/>`;
  document.getElementById(svgId).innerHTML=`<svg width="150" height="150" viewBox="0 0 150 150">${paths}<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1a2e">$${total>1?total.toFixed(0):'0'}</text></svg>`;
  document.getElementById(legendId).innerHTML=entries.map(([label,amt])=>{
    const color=colorFn(label);
    return `<div class="legend-item"><div class="legend-left"><span class="cat-dot" style="background:${color}"></span>${label}</div><div class="legend-pct">${((amt/total)*100).toFixed(1)}% · $${amt.toFixed(2)}</div></div>`;
  }).join('');
}