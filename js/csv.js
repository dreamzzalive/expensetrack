// ═══════════════════════════════════════════════════════════════
// CSV
// ═══════════════════════════════════════════════════════════════
function importCSV(e){
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    const lines=ev.target.result.split('\n').filter(l=>l.trim()); let imp=0,err=0;
    lines.forEach((line,i)=>{ if(i===0&&line.toLowerCase().includes('date'))return; const p=line.split(',').map(s=>s.trim().replace(/^"|"$/g,'')); const[date,desc,amount,cat,acc,type]=p; const amt=parseFloat(amount); if(!date||isNaN(amt)||amt<=0){err++;return;} const isInc=(type||'').toLowerCase()==='income'; if(isInc){if(!st.income)st.income=[];st.income.push({id:'inc_'+Date.now()+Math.random(),amount:amt,description:desc||'',date,category:(st.incomeCategories||DEFAULT_INCOME_CATEGORIES).includes(cat)?cat:(st.incomeCategories||DEFAULT_INCOME_CATEGORIES)[0],account:st.accounts.includes(acc)?acc:st.accounts[0],notes:''});}else{st.transactions.push({id:Date.now()+Math.random()+'',amount:amt,description:desc||'',date,category:st.categories.includes(cat)?cat:st.categories[0],account:st.accounts.includes(acc)?acc:st.accounts[0],notes:''});} imp++; });
    save(); document.getElementById('csv-status').textContent='✅ Imported '+imp+' rows'+(err?' ('+err+' skipped)':''); showToast('Imported '+imp+' records');
  };
  reader.readAsText(file);
}
function exportCSV(){
  const rows=[['date','description','amount','category','account','type']];
  [...st.transactions].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t=>rows.push([t.date,t.description||'',t.amount,t.category,t.account,'expense']));
  [...(st.income||[])].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t=>rows.push([t.date,t.description||'',t.amount,t.category,t.account,'income']));
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='expensetrack_export.csv'; a.click(); showToast('✅ Exported');
}