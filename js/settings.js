// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════
function renderSettings(){
  const ua=document.getElementById('settings-user-area');
  if(currentUser){
    const init=(currentUser.displayName||currentUser.email||'U')[0].toUpperCase();
    ua.innerHTML='<div class="user-pill"><div class="user-pill-avatar">'+init+'</div><div class="user-pill-info"><div class="user-pill-name">'+(currentUser.displayName||'User')+'</div><div class="user-pill-email">'+currentUser.email+'</div></div><button onclick="doLogout()">Sign Out</button></div>';
  } else {
    ua.innerHTML=FIREBASE_READY?'<div class="settings-row" onclick="showAuth()"><div><div class="settings-row-label">Sign In / Sign Up</div><div class="settings-row-sub">Sync across devices</div></div><span style="font-size:20px;color:var(--primary)">›</span></div>':'<div class="settings-row"><div><div class="settings-row-label">Demo Mode</div><div class="settings-row-sub">Add Firebase config to enable sync</div></div></div>';
  }
  document.getElementById('cat-tags').innerHTML=st.categories.map(c=>'<span class="tag">'+c+'<span class="tag-del" onclick="delCat(\''+c+'\')">×</span></span>').join('');
  document.getElementById('inc-cat-tags').innerHTML=(st.incomeCategories||DEFAULT_INCOME_CATEGORIES).map(c=>'<span class="tag" style="background:#d1fae5;color:#065f46">'+c+'<span class="tag-del" onclick="delIncCat(\''+c+'\')">×</span></span>').join('');
  document.getElementById('acc-tags').innerHTML=st.accounts.map(a=>'<span class="tag">'+a+'<span class="tag-del" onclick="delAcc(\''+a+'\')">×</span></span>').join('');
}
function addCategory(){ const v=document.getElementById('new-cat-input').value.trim(); if(!v||st.categories.includes(v)){showToast('⚠️ Invalid or duplicate');return;} st.categories.push(v); save(); renderSettings(); document.getElementById('new-cat-input').value=''; showToast('✅ Added'); }
function delCat(c){ if(st.categories.length<=1){showToast('Keep at least 1');return;} st.categories=st.categories.filter(x=>x!==c); save(); renderSettings(); }
function addIncomeCategory(){ const v=document.getElementById('new-inc-cat-input').value.trim(); if(!v||(st.incomeCategories||[]).includes(v)){showToast('⚠️ Invalid or duplicate');return;} if(!st.incomeCategories)st.incomeCategories=[...DEFAULT_INCOME_CATEGORIES]; st.incomeCategories.push(v); save(); renderSettings(); document.getElementById('new-inc-cat-input').value=''; showToast('✅ Added'); }
function delIncCat(c){ if((st.incomeCategories||[]).length<=1){showToast('Keep at least 1');return;} st.incomeCategories=st.incomeCategories.filter(x=>x!==c); save(); renderSettings(); }
function addAccount(){ const v=document.getElementById('new-acc-input').value.trim(); if(!v||st.accounts.includes(v)){showToast('⚠️ Invalid or duplicate');return;} st.accounts.push(v); save(); renderSettings(); document.getElementById('new-acc-input').value=''; showToast('✅ Added'); }
function delAcc(a){ if(st.accounts.length<=1){showToast('Keep at least 1');return;} st.accounts=st.accounts.filter(x=>x!==a); save(); renderSettings(); }
function clearAllData(){ if(!confirm('Clear ALL data? Cannot be undone.'))return; st=defaultState(); save(); renderDashboard(); showToast('Cleared'); }