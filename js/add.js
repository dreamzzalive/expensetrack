// ═══════════════════════════════════════════════════════════════
// ADD TRANSACTION
// ═══════════════════════════════════════════════════════════════
function populateFormSelects(){
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('inp-date').value=today; document.getElementById('inc-date').value=today;
  document.getElementById('inp-cat').innerHTML=st.categories.map(c=>'<option>'+c+'</option>').join('');
  document.getElementById('inp-account').innerHTML=st.accounts.map(a=>'<option>'+a+'</option>').join('');
  document.getElementById('inc-cat').innerHTML=(st.incomeCategories||DEFAULT_INCOME_CATEGORIES).map(c=>'<option>'+c+'</option>').join('');
  document.getElementById('inc-account').innerHTML=st.accounts.map(a=>'<option>'+a+'</option>').join('');
}
function switchAddTab(tab,btn){
  document.querySelectorAll('.add-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.getElementById('add-expense-form').style.display=tab==='expense'?'block':'none';
  document.getElementById('add-income-form').style.display=tab==='income'?'block':'none';
}
function addExpense(){
  const amt=parseFloat(document.getElementById('inp-amount').value);
  const date=document.getElementById('inp-date').value;
  if(!amt||amt<=0){showToast('⚠️ Enter a valid amount');return;}
  st.transactions.push({id:Date.now().toString(),amount:amt,description:document.getElementById('inp-desc').value.trim(),date,category:document.getElementById('inp-cat').value,account:document.getElementById('inp-account').value,notes:document.getElementById('inp-notes').value.trim()});
  save(); document.getElementById('inp-amount').value=''; document.getElementById('inp-desc').value=''; document.getElementById('inp-notes').value=''; showToast('✅ Expense added!');
}
function addIncome(){
  const amt=parseFloat(document.getElementById('inc-amount').value);
  const date=document.getElementById('inc-date').value;
  if(!amt||amt<=0){showToast('⚠️ Enter a valid amount');return;}
  if(!st.income)st.income=[];
  st.income.push({id:'inc_'+Date.now(),amount:amt,description:document.getElementById('inc-desc').value.trim(),date,category:document.getElementById('inc-cat').value,account:document.getElementById('inc-account').value,notes:document.getElementById('inc-notes').value.trim()});
  save(); document.getElementById('inc-amount').value=''; document.getElementById('inc-desc').value=''; document.getElementById('inc-notes').value=''; showToast('✅ Income added!');
}