function populateFormSelects(){
  document.getElementById('inp-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('inp-cat').innerHTML=(state.categories||[]).map(c=>`<option>${c}</option>`).join('');
  document.getElementById('inp-account').innerHTML=(state.accounts||[]).map(a=>`<option>${a}</option>`).join('');
  document.getElementById('inc-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('inc-cat').innerHTML=(state.incomeCategories||DEFAULT_INCOME_CATEGORIES).map(c=>`<option>${c}</option>`).join('');
  document.getElementById('inc-account').innerHTML=(state.accounts||[]).map(a=>`<option>${a}</option>`).join('');
}

function switchAddTab(tab,btn){
  document.querySelectorAll('.add-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('add-expense-form').style.display=tab==='expense'?'block':'none';
  document.getElementById('add-income-form').style.display=tab==='income'?'block':'none';
}

function addExpense(){
  const amt=parseFloat(document.getElementById('inp-amount').value);
  const date=document.getElementById('inp-date').value;
  const cat=document.getElementById('inp-cat').value;
  const acc=document.getElementById('inp-account').value;
  const desc=document.getElementById('inp-desc').value.trim();
  const notes=document.getElementById('inp-notes').value.trim();
  if(!amt||amt<=0){showToast('⚠️ Enter a valid amount');return;}
  if(!date){showToast('⚠️ Select a date');return;}
  state.transactions.push({id:Date.now().toString(),amount:amt,description:desc,date,category:cat,account:acc,notes});
  saveState();
  document.getElementById('inp-amount').value='';
  document.getElementById('inp-desc').value='';
  document.getElementById('inp-notes').value='';
  showToast('✅ Expense added!');
}

function addIncome(){
  const amt=parseFloat(document.getElementById('inc-amount').value);
  const date=document.getElementById('inc-date').value;
  const cat=document.getElementById('inc-cat').value;
  const acc=document.getElementById('inc-account').value;
  const desc=document.getElementById('inc-desc').value.trim();
  const notes=document.getElementById('inc-notes').value.trim();
  if(!amt||amt<=0){showToast('⚠️ Enter a valid amount');return;}
  if(!date){showToast('⚠️ Select a date');return;}
  if(!state.income)state.income=[];
  state.income.push({id:'inc_'+Date.now().toString(),amount:amt,description:desc,date,category:cat,account:acc,notes});
  saveState();
  document.getElementById('inc-amount').value='';
  document.getElementById('inc-desc').value='';
  document.getElementById('inc-notes').value='';
  showToast('✅ Income added!');
}
