// ═══════════════════════════════════════════════════════════════
// TRANSFERS
// ═══════════════════════════════════════════════════════════════
function openTransferModal(){
  document.getElementById('tr-from').innerHTML=st.accounts.map(a=>'<option>'+a+'</option>').join('');
  document.getElementById('tr-to').innerHTML=st.accounts.map(a=>'<option>'+a+'</option>').join('');
  if(st.accounts.length>1) document.getElementById('tr-to').selectedIndex=1;
  document.getElementById('tr-amount').value=''; document.getElementById('tr-date').value=new Date().toISOString().split('T')[0]; document.getElementById('tr-desc').value=''; document.getElementById('tr-modal-err').textContent='';
  document.getElementById('transfer-modal').classList.add('open');
}
function closeTransferModal(){ document.getElementById('transfer-modal').classList.remove('open'); }
function submitTransfer(){
  const amt=parseFloat(document.getElementById('tr-amount').value);
  const from=document.getElementById('tr-from').value; const to=document.getElementById('tr-to').value;
  const date=document.getElementById('tr-date').value;
  if(!amt||amt<=0){document.getElementById('tr-modal-err').textContent='⚠️ Enter a valid amount';return;}
  if(from===to){document.getElementById('tr-modal-err').textContent='⚠️ From and To must differ';return;}
  if(!st.transfers)st.transfers=[];
  st.transfers.push({id:'tr_'+Date.now(),amount:amt,from,to,date,description:document.getElementById('tr-desc').value.trim()});
  save(); closeTransferModal(); renderDashboard(); showToast('🔄 Transfer recorded');
}