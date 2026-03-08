/* ── Transfer logic ────────────────────────────────────────────────────────
   A transfer moves money FROM one account TO another.
   - FROM account: net balance goes DOWN  (money leaves)
   - TO   account: net balance goes UP    (money arrives / reduces liability)
   Credit card balances are computed as:  expenses charged - transfers received
   ──────────────────────────────────────────────────────────────────────── */

function openTransferModal(){
  document.getElementById('tr-from').innerHTML=(state.accounts||[]).map(a=>`<option>${a}</option>`).join('');
  document.getElementById('tr-to').innerHTML=(state.accounts||[]).map(a=>`<option>${a}</option>`).join('');
  // default: first account → second account
  if((state.accounts||[]).length>1) document.getElementById('tr-to').selectedIndex=1;
  document.getElementById('tr-amount').value='';
  document.getElementById('tr-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('tr-desc').value='';
  document.getElementById('tr-modal-err').textContent='';
  document.getElementById('transfer-modal').classList.add('open');
  setTimeout(()=>document.getElementById('tr-amount').focus(),300);
}
function closeTransferModal(){document.getElementById('transfer-modal').classList.remove('open');}

function submitTransfer(){
  const amt   = parseFloat(document.getElementById('tr-amount').value);
  const from  = document.getElementById('tr-from').value;
  const to    = document.getElementById('tr-to').value;
  const date  = document.getElementById('tr-date').value;
  const desc  = document.getElementById('tr-desc').value.trim();
  const errEl = document.getElementById('tr-modal-err');
  if(!amt||amt<=0){errEl.textContent='⚠️ Enter a valid amount';return;}
  if(from===to){errEl.textContent='⚠️ From and To accounts must differ';return;}
  if(!date){errEl.textContent='⚠️ Select a date';return;}
  if(!state.transfers)state.transfers=[];
  state.transfers.push({id:'tr_'+Date.now(),amount:amt,from,to,date,description:desc});
  saveState();
  closeTransferModal();
  renderDashboard();
  showToast('🔄 Transfer recorded');
}

function deleteTransfer(id){
  state.transfers=(state.transfers||[]).filter(t=>t.id!==id);
  saveState();renderDashboard();showToast('Transfer deleted');
}

/** Returns net balance for an account:
 *  income received + transfers in - expenses charged - transfers out  */
function getAccountBalance(acc){
  const income   = (state.income||[]).filter(t=>t.account===acc).reduce((s,t)=>s+t.amount,0);
  const expenses = state.transactions.filter(t=>t.account===acc).reduce((s,t)=>s+t.amount,0);
  const txIn     = (state.transfers||[]).filter(t=>t.to===acc).reduce((s,t)=>s+t.amount,0);
  const txOut    = (state.transfers||[]).filter(t=>t.from===acc).reduce((s,t)=>s+t.amount,0);
  return income + txIn - expenses - txOut;
}

/** Returns outstanding (unpaid) balance for an account (useful for credit cards):
 *  expenses charged - transfers received  */
function getAccountOutstanding(acc){
  const expenses = state.transactions.filter(t=>t.account===acc).reduce((s,t)=>s+t.amount,0);
  const paid     = (state.transfers||[]).filter(t=>t.to===acc).reduce((s,t)=>s+t.amount,0);
  return Math.max(0, expenses - paid);
}

function transferCard(t){
  const fromColor = ACC_COLORS[(state.accounts||[]).indexOf(t.from)%ACC_COLORS.length];
  const toColor   = ACC_COLORS[(state.accounts||[]).indexOf(t.to  )%ACC_COLORS.length];
  return `<div class="tx-item">
    <div class="tx-icon" style="background:#e0f2fe">🔄</div>
    <div class="tx-info">
      <div class="tx-cat" style="color:#0ea5e9">Transfer</div>
      ${t.description?`<div class="tx-desc">${t.description}</div>`:''}
      <div class="tx-meta">
        <span style="color:${fromColor};font-weight:600">${t.from}</span>
        <span style="color:var(--muted)"> → </span>
        <span style="color:${toColor};font-weight:600">${t.to}</span>
        · ${t.date}
      </div>
    </div>
    <div class="tx-amt" style="color:#0ea5e9">$${t.amount.toFixed(2)}</div>
    <button class="tx-del" onclick="deleteTransfer('${t.id}')">✕</button>
  </div>`;
}
