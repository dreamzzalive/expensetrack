// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
let calMonth=new Date(); calMonth.setDate(1); let calSel=null;
function calChangeMonth(d){ calMonth.setMonth(calMonth.getMonth()+d); renderCalendar(); }
function renderCalendar(){
  const y=calMonth.getFullYear(),m=calMonth.getMonth();
  document.getElementById('cal-month-label').textContent=calMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
  const today=new Date().toISOString().split('T')[0];
  const hasTx=new Set([...st.transactions,...(st.income||[])].filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===m; }).map(t=>t.date));
  let h=['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>'<div class="cal-day-label">'+d+'</div>').join('');
  const first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++) h+='<div class="cal-day empty"></div>';
  for(let d=1;d<=dim;d++){
    const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    h+='<div class="cal-day'+(ds===today?' today':'')+(ds===calSel?' selected':'')+(hasTx.has(ds)?' has-tx':'')+'" onclick="calSelectDay(\''+ds+'\')">'+d+'</div>';
  }
  document.getElementById('cal-grid').innerHTML=h;
  renderCalTxList();
}
function calSelectDay(ds){ calSel=ds; renderCalendar(); }
function renderCalTxList(){
  const sec=document.getElementById('cal-tx-section'); if(!calSel){sec.innerHTML='';return;}
  const txs=[...st.transactions.filter(t=>t.date===calSel).map(t=>({...t,_t:'e'})),...(st.income||[]).filter(t=>t.date===calSel).map(t=>({...t,_t:'i'}))].sort((a,b)=>b.amount-a.amount);
  const total=txs.reduce((s,t)=>s+t.amount,0);
  const lbl=new Date(calSel+'T00:00:00').toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long'});
  sec.innerHTML='<div class="cal-date-header"><div><div class="cal-date-label">'+lbl+'</div>'+(txs.length?'<div class="cal-date-total">$'+total.toFixed(2)+' · '+txs.length+' record'+(txs.length!==1?'s':'')+'</div>':'')+'</div><button class="cal-add-btn" onclick="openCalAddModal(\''+calSel+'\')">+ Add</button></div>'+(txs.length?'<div class="cal-tx-list">'+txs.map(t=>t._t==='i'?incCard(t,true):txCard(t,true)).join('')+'</div>':'<div class="empty-state" style="padding:20px">No records. Tap + Add to log one.</div>');
}
function openCalAddModal(date){
  document.getElementById('cal-modal-date-label').textContent=new Date(date+'T00:00:00').toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  document.getElementById('cal-inp-date').value=date;
  document.getElementById('cal-inp-cat').innerHTML=st.categories.map(c=>'<option>'+c+'</option>').join('');
  document.getElementById('cal-inp-acc').innerHTML=st.accounts.map(a=>'<option>'+a+'</option>').join('');
  document.getElementById('cal-inp-amount').value=''; document.getElementById('cal-inp-desc').value=''; document.getElementById('cal-modal-err').textContent='';
  document.getElementById('cal-add-modal').classList.add('open');
  setTimeout(()=>document.getElementById('cal-inp-amount').focus(),300);
}
function closeCalAddModal(){ document.getElementById('cal-add-modal').classList.remove('open'); }
function submitCalAdd(){
  const amt=parseFloat(document.getElementById('cal-inp-amount').value);
  if(!amt||amt<=0){document.getElementById('cal-modal-err').textContent='⚠️ Enter a valid amount';return;}
  st.transactions.push({id:Date.now().toString(),amount:amt,description:document.getElementById('cal-inp-desc').value.trim(),date:document.getElementById('cal-inp-date').value,category:document.getElementById('cal-inp-cat').value,account:document.getElementById('cal-inp-acc').value,notes:''});
  save(); closeCalAddModal(); renderCalTxList(); renderCalendar(); showToast('✅ Expense added!');
}