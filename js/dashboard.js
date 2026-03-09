// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
let dashMonth=new Date(); dashMonth.setDate(1);
function changeMonth(d){ dashMonth.setMonth(dashMonth.getMonth()+d); renderDashboard(); }
function getMonthTxs(arr,dm){ const y=dm.getFullYear(),m=dm.getMonth(); return (arr||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===m; }); }
function byKey(arr,key){ const r={}; arr.forEach(t=>{ r[t[key]]=(r[t[key]]||0)+t.amount; }); return Object.entries(r).sort((a,b)=>b[1]-a[1]); }

function renderDashboard(){
  const now=new Date();
  document.getElementById('dash-date').textContent=now.toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  renderUserHeader();
  document.getElementById('dash-month-label').textContent=dashMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
  const txs=getMonthTxs(st.transactions,dashMonth);
  const inc=getMonthTxs(st.income,dashMonth);
  const totalExp=txs.reduce((s,t)=>s+t.amount,0);
  const totalInc=inc.reduce((s,t)=>s+t.amount,0);
  const net=totalInc-totalExp;
  document.getElementById('dash-total-exp').textContent='$'+totalExp.toFixed(2);
  document.getElementById('dash-total-inc').textContent='$'+totalInc.toFixed(2);
  document.getElementById('dash-net').textContent=(net>=0?'+$':'-$')+Math.abs(net).toFixed(2);
  document.getElementById('dash-net').style.color=net>=0?'#10b981':'#f04a4a';
  document.getElementById('dash-sub').textContent=txs.length+' expense'+(txs.length!==1?'s':'')+' · '+inc.length+' income record'+(inc.length!==1?'s':'');
  // category bar + list
  const catE=byKey(txs,'category'); const maxCat=catE.length?catE[0][1]:1;
  barChart(document.getElementById('bar-chart-card'),catE,getCatColor);
  document.getElementById('cat-summary-list').innerHTML=catE.map(([k,v])=>{
    const c=getCatColor(k),cnt=txs.filter(t=>t.category===k).length;
    return '<div class="cat-bar-item" onclick="openCatDetail(\''+k+'\')"><div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:'+c+'"></span>'+k+'</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-weight:700">$'+v.toFixed(2)+'</span><span class="cat-chevron">›</span></div></div><div class="bar-track"><div class="bar-fill" style="width:'+((v/maxCat)*100).toFixed(0)+'%;background:'+c+'"></div></div><div class="cat-bar-meta">'+cnt+' transaction'+(cnt!==1?'s':'')+'</div></div>';
  }).join('')||'<div class="empty-state">No expenses this month</div>';
  // account bar + list
  const accE=byKey(txs,'account'); const maxAcc=accE.length?accE[0][1]:1;
  barChart(document.getElementById('acc-chart-card'),accE,getAccColor);
  document.getElementById('acc-summary-list').innerHTML=accE.map(([k,v])=>{
    const c=getAccColor(k),cnt=txs.filter(t=>t.account===k).length;
    return '<div class="cat-bar-item" onclick="openAccDetail(\''+k+'\')"><div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:'+c+'"></span>'+getAccEmoji(k)+' '+k+'</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-weight:700">$'+v.toFixed(2)+'</span><span class="cat-chevron">›</span></div></div><div class="bar-track"><div class="bar-fill" style="width:'+((v/maxAcc)*100).toFixed(0)+'%;background:'+c+'"></div></div><div class="cat-bar-meta">'+cnt+' transaction'+(cnt!==1?'s':'')+'</div></div>';
  }).join('')||'<div class="empty-state">No account data this month</div>';
  // income bar + list
  const incE=byKey(inc,'category'); const maxInc=incE.length?incE[0][1]:1;
  barChart(document.getElementById('inc-chart-card'),incE,getIncColor);
  document.getElementById('inc-summary-list').innerHTML=incE.map(([k,v])=>{
    const c=getIncColor(k),cnt=inc.filter(t=>t.category===k).length;
    return '<div class="cat-bar-item" onclick="openIncDetail(\''+k+'\')"><div class="cat-bar-row"><div class="cat-bar-name"><span class="cat-dot" style="background:'+c+'"></span>'+getIncEmoji(k)+' '+k+'</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-weight:700;color:'+c+'">$'+v.toFixed(2)+'</span><span class="cat-chevron">›</span></div></div><div class="bar-track"><div class="bar-fill" style="width:'+((v/maxInc)*100).toFixed(0)+'%;background:'+c+'"></div></div><div class="cat-bar-meta">'+cnt+' record'+(cnt!==1?'s':'')+'</div></div>';
  }).join('')||'<div class="empty-state">No income this month</div>';
  // recent
  const all=[...st.transactions.map(t=>({...t,_t:'e'})),...(st.income||[]).map(t=>({...t,_t:'i'}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
  document.getElementById('recent-list').innerHTML=all.map(t=>t._t==='i'?incCard(t,true):txCard(t,true)).join('')||'<div class="empty-state">No transactions yet</div>';
  // sync banner
  const sb=document.getElementById('sync-banner-wrap');
  if(sb){ if(!currentUser&&!FIREBASE_READY) sb.innerHTML='<div class="sync-banner">🔒 Demo mode — data saved locally only</div>'; else sb.innerHTML=''; }
}
function renderUserHeader(){
  const el = document.getElementById('dash-user-pill');
  if(!el) return;
  if(currentUser){
    const initial = (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase();
    const name    = currentUser.displayName || currentUser.email.split('@')[0];
    el.innerHTML =
      '<div class="dash-user-pill">' +
        '<div class="dash-user-avatar">'+initial+'</div>' +
        '<div class="dash-user-info">' +
          '<div class="dash-user-name">'+name+'</div>' +
          '<div class="dash-user-email">'+currentUser.email+'</div>' +
        '</div>' +
        '<button class="dash-signout-btn" onclick="confirmLogout()">Sign Out</button>' +
      '</div>';
  } else {
    el.innerHTML = '<div class="dash-user-pill dash-user-demo"><span>🔒 Demo Mode</span><button class="dash-signin-btn" onclick="showAuth()">Sign In</button></div>';
  }
}

function confirmLogout(){
  if(confirm('Sign out of ExpenseTrack?')) doLogout();
}
