let calMonth=new Date();calMonth.setDate(1);let calSelected=null;

function calChangeMonth(d){calMonth.setMonth(calMonth.getMonth()+d);renderCalendar();}

function renderCalendar(){
  const y=calMonth.getFullYear(),m=calMonth.getMonth();
  document.getElementById('cal-month-label').textContent=calMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
  let html=['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  const first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),today=new Date().toISOString().split('T')[0];
  const txDates=new Set(state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m;}).map(t=>t.date));
  for(let i=0;i<first;i++)html+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=dim;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html+=`<div class="cal-day${ds===today?' today':''}${ds===calSelected?' selected':''}${txDates.has(ds)?' has-tx':''}" onclick="calSelectDay('${ds}')">${d}</div>`;
  }
  document.getElementById('cal-grid').innerHTML=html;
  renderCalTxList();
}

function calSelectDay(ds){calSelected=ds;renderCalendar();}

function renderCalTxList(){
  const sec=document.getElementById('cal-tx-section');
  if(!calSelected){sec.innerHTML='';return;}
  const txs=[
    ...state.transactions.filter(t=>t.date===calSelected).map(t=>({...t,_type:'expense'})),
    ...(state.income||[]).filter(t=>t.date===calSelected).map(t=>({...t,_type:'income'}))
  ].sort((a,b)=>b.amount-a.amount);
  const total=txs.reduce((s,t)=>s+t.amount,0);
  const dateLabel=new Date(calSelected+'T00:00:00').toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  sec.innerHTML=`
    <div class="cal-date-header">
      <div>
        <div class="cal-date-label">${dateLabel}</div>
        ${txs.length?`<div class="cal-date-total">$${total.toFixed(2)} · ${txs.length} transaction${txs.length!==1?'s':''}</div>`:''}
      </div>
      <button class="cal-add-btn" onclick="openCalAddModal('${calSelected}')">+ Add</button>
    </div>
    ${txs.length
      ? `<div class="cal-tx-list">${txs.map(t=>t._type==='income'?incomeCard(t,true):txCard(t,true)).join('')}</div>`
      : '<div class="empty-state" style="padding:24px 20px">No transactions on this day.<br>Tap <strong>+ Add</strong> to log one.</div>'
    }`;
}

/* ── Inline Add Modal for Calendar ── */
function openCalAddModal(date){
  // populate selects
  document.getElementById('cal-modal-date-label').textContent=
    new Date(date+'T00:00:00').toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  document.getElementById('cal-inp-date').value=date;
  document.getElementById('cal-inp-cat').innerHTML=(state.categories||[]).map(c=>`<option>${c}</option>`).join('');
  document.getElementById('cal-inp-acc').innerHTML=(state.accounts||[]).map(a=>`<option>${a}</option>`).join('');
  document.getElementById('cal-inp-amount').value='';
  document.getElementById('cal-inp-desc').value='';
  document.getElementById('cal-modal-err').textContent='';
  document.getElementById('cal-add-modal').classList.add('open');
  setTimeout(()=>document.getElementById('cal-inp-amount').focus(),300);
}

function closeCalAddModal(){document.getElementById('cal-add-modal').classList.remove('open');}

function submitCalAdd(){
  const amt=parseFloat(document.getElementById('cal-inp-amount').value);
  const date=document.getElementById('cal-inp-date').value;
  const cat=document.getElementById('cal-inp-cat').value;
  const acc=document.getElementById('cal-inp-acc').value;
  const desc=document.getElementById('cal-inp-desc').value.trim();
  if(!amt||amt<=0){document.getElementById('cal-modal-err').textContent='⚠️ Enter a valid amount';return;}
  state.transactions.push({id:Date.now().toString(),amount:amt,description:desc,date,category:cat,account:acc,notes:''});
  saveState();
  closeCalAddModal();
  renderCalTxList();
  renderCalendar();
  showToast('✅ Expense added for '+date);
}
