// ═══════════════════════════════════════════════════════════════
// CSV
// ═══════════════════════════════════════════════════════════════
let csvStagedRows = [];
let csvFileName   = '';

/* ── Parse a single CSV line respecting quoted fields ── */
function parseCSVLine(line){
  // Strip Windows \r
  line = line.replace(/\r/g, '');
  var result=[], cur='', inQ=false;
  for(var i=0;i<line.length;i++){
    var c=line[i];
    if(c==='"'){ inQ=!inQ; }
    else if(c===','&&!inQ){ result.push(cur.trim()); cur=''; }
    else cur+=c;
  }
  result.push(cur.trim());
  return result;
}

/* ── Step 1: Parse file → show preview ── */
function importCSV(e){
  var file=e.target.files[0]; if(!file) return;
  csvFileName=file.name;
  var reader=new FileReader();
  reader.onload=function(ev){
    var raw=ev.target.result.split('\n').filter(function(l){ return l.trim(); });
    var rows=[], errors=[];
    raw.forEach(function(line,i){
      if(i===0&&line.toLowerCase().includes('date')) return; // header
      var p=parseCSVLine(line);
      var date=p[0]||'', desc=p[1]||'', amount=p[2]||'',
          cat=(p[3]||'').trim(), acc=(p[4]||'').trim(),
          type=(p[5]||'').toLowerCase().trim(),
          toAcc=(p[6]||'').trim(),
          isRec=(p[7]||'').toLowerCase().trim(),
          freq=(p[8]||'monthly').toLowerCase().trim();
      var amt=parseFloat(amount);
      if(!date||isNaN(amt)||amt<=0){ errors.push('Row '+(i+1)+': invalid'); return; }
      var txType=type==='income'?'income':type==='transfer'?'transfer':'expense';
      var recurring=isRec==='yes'||isRec==='true';
      if(!freq||freq==='') freq='monthly';
      rows.push({date:date.trim(),desc:desc,amt:amt,cat:cat,acc:acc,
                 type:txType,toAcc:toAcc,recurring:recurring,freq:freq});
    });
    csvStagedRows=rows;
    showCSVPreview(rows,errors);
  };
  reader.readAsText(file);
  e.target.value='';
}

/* ── Step 2: Preview modal ── */
function showCSVPreview(rows,errors){
  var statusEl=document.getElementById('csv-status');
  var nExp=rows.filter(function(r){return r.type==='expense';}).length;
  var nInc=rows.filter(function(r){return r.type==='income';}).length;
  var nTr =rows.filter(function(r){return r.type==='transfer';}).length;
  var nRec=rows.filter(function(r){return r.recurring;}).length;
  var preview=rows.slice(0,8);
  var tableRows=preview.map(function(r){
    var tl=r.type==='income'?'<span style="color:#10b981;font-weight:700">Income</span>'
          :r.type==='transfer'?'<span style="color:#0ea5e9;font-weight:700">Transfer</span>'
          :'<span style="color:#f04a4a;font-weight:700">Expense</span>';
    return '<tr style="border-bottom:1px solid var(--border);">'+
      '<td style="padding:6px 4px;font-size:12px;">'+r.date+'</td>'+
      '<td style="padding:6px 4px;font-size:12px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+r.desc+(r.recurring?' 🔁':'')+'</td>'+
      '<td style="padding:6px 4px;font-size:12px;text-align:right;">$'+r.amt.toFixed(2)+'</td>'+
      '<td style="padding:6px 4px;font-size:12px;">'+r.cat+'</td>'+
      '<td style="padding:6px 4px;font-size:12px;">'+tl+'</td>'+
    '</tr>';
  }).join('');
  var moreNote=rows.length>8?'<div style="font-size:12px;color:var(--muted);padding:8px 0;">...and '+(rows.length-8)+' more rows</div>':'';
  statusEl.innerHTML=
    '<div style="background:var(--card);border-radius:var(--r);padding:16px;box-shadow:var(--sh);margin-top:10px;">'+
      '<div style="font-size:14px;font-weight:700;margin-bottom:10px;">📂 '+csvFileName+'</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">'+
        '<span style="background:#fde8e8;color:#f04a4a;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">💸 '+nExp+' Expenses</span>'+
        '<span style="background:#d1fae5;color:#10b981;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">💰 '+nInc+' Income</span>'+
        (nTr?'<span style="background:#e0f2fe;color:#0ea5e9;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">🔄 '+nTr+' Transfers</span>':'')+
        (nRec?'<span style="background:#ede9fe;color:#8b5cf6;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">🔁 '+nRec+' Recurring</span>':'')+
        (errors.length?'<span style="background:#fef3c7;color:#92400e;border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700;">⚠️ '+errors.length+' Skipped</span>':'')+
      '</div>'+
      '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">'+
        '<thead><tr style="border-bottom:2px solid var(--border);">'+
          '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Date</th>'+
          '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Description</th>'+
          '<th style="padding:6px 4px;font-size:11px;text-align:right;color:var(--muted);">Amount</th>'+
          '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Category</th>'+
          '<th style="padding:6px 4px;font-size:11px;text-align:left;color:var(--muted);">Type</th>'+
        '</tr></thead><tbody>'+tableRows+'</tbody></table></div>'+
      moreNote+
      '<div style="display:flex;gap:10px;margin-top:14px;">'+
        '<button onclick="confirmCSVImport()" class="btn-primary" style="flex:1;">✅ Import '+rows.length+' rows</button>'+
        '<button onclick="cancelCSVImport()" style="flex:0 0 auto;background:var(--border);color:var(--text);border:none;border-radius:var(--rs);padding:12px 16px;font-weight:700;cursor:pointer;">Cancel</button>'+
      '</div>'+
    '</div>';
}

/* ── Step 3: Confirm import ── */
function confirmCSVImport(){
  var imp=0;
  if(!st.categories)       st.categories=[...DEFAULT_CATEGORIES];
  if(!st.accounts)         st.accounts=[...DEFAULT_ACCOUNTS];
  if(!st.incomeCategories) st.incomeCategories=[...DEFAULT_INCOME_CATEGORIES];
  if(!st.recurring)        st.recurring=[];

  // ── Pass 1: auto-create missing categories & accounts ──
  csvStagedRows.forEach(function(r){
    var cat=r.cat, acc=r.acc, toAcc=r.toAcc;
    if(r.type==='expense'  && cat && cat!=='Transfer' && !st.categories.includes(cat))       st.categories.push(cat);
    if(r.type==='income'   && cat && !st.incomeCategories.includes(cat))                      st.incomeCategories.push(cat);
    if(acc   && acc!==''   && !st.accounts.includes(acc))                                     st.accounts.push(acc);
    if(toAcc && toAcc!=='' && !st.accounts.includes(toAcc))                                   st.accounts.push(toAcc);
  });

  var accs=st.accounts, cats=st.categories, incCats=st.incomeCategories;

  // ── Pass 2: insert transactions & create recurring rules ──
  csvStagedRows.forEach(function(r){
    var id='csv_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    if(r.type==='transfer'){
      if(!st.transfers) st.transfers=[];
      st.transfers.push({id:'tr_'+id,amount:r.amt,description:r.desc,date:r.date,
        from:accs.includes(r.acc)?r.acc:accs[0],
        to:accs.includes(r.toAcc)?r.toAcc:(accs.length>1?accs[1]:accs[0]),notes:''});
    } else if(r.type==='income'){
      if(!st.income) st.income=[];
      var resolvedCat=incCats.includes(r.cat)?r.cat:incCats[0];
      var resolvedAcc=accs.includes(r.acc)?r.acc:accs[0];
      st.income.push({id:'inc_'+id,amount:r.amt,description:r.desc,date:r.date,
        category:resolvedCat,account:resolvedAcc,
        notes:r.recurring?'🔁 Recurring':'',
        recurringId:r.recurring?'csv_rec_'+resolvedCat+'_'+resolvedAcc:undefined});
      // Create recurring rule if needed
      if(r.recurring) ensureRecurringRule('income',r.amt,resolvedCat,resolvedAcc,r.desc,r.freq,r.date);
    } else {
      var resolvedCat=cats.includes(r.cat)?r.cat:cats[0];
      var resolvedAcc=accs.includes(r.acc)?r.acc:accs[0];
      st.transactions.push({id:'exp_'+id,amount:r.amt,description:r.desc,date:r.date,
        category:resolvedCat,account:resolvedAcc,
        notes:r.recurring?'🔁 Recurring':'',
        recurringId:r.recurring?'csv_rec_'+resolvedCat+'_'+resolvedAcc:undefined});
      if(r.recurring) ensureRecurringRule('expense',r.amt,resolvedCat,resolvedAcc,r.desc,r.freq,r.date);
    }
    imp++;
  });

  save();
  renderDashboard();
  renderSettings();
  if(typeof renderCalendar==='function') renderCalendar();

  var snapCats=st.categories, snapAccs=st.accounts, snapInc=st.incomeCategories;
  var addedCats=snapCats.filter(function(c){return !DEFAULT_CATEGORIES.includes(c);});
  var addedAccs=snapAccs.filter(function(a){return !DEFAULT_ACCOUNTS.includes(a);});
  var addedIncCats=snapInc.filter(function(c){return !DEFAULT_INCOME_CATEGORIES.includes(c);});
  var recRules=st.recurring.filter(function(r){return r.id.startsWith('csv_rec_');}).length;
  var extraNote='';
  if(addedCats.length)    extraNote+='<div style="margin-top:6px;font-size:12px;">📁 New expense categories: <strong>'+addedCats.join(', ')+'</strong></div>';
  if(addedIncCats.length) extraNote+='<div style="margin-top:4px;font-size:12px;">📁 New income categories: <strong>'+addedIncCats.join(', ')+'</strong></div>';
  if(addedAccs.length)    extraNote+='<div style="margin-top:4px;font-size:12px;">🏦 New accounts: <strong>'+addedAccs.join(', ')+'</strong></div>';
  if(recRules>0)          extraNote+='<div style="margin-top:4px;font-size:12px;">🔁 Recurring rules created: <strong>'+recRules+'</strong></div>';

  csvStagedRows=[];
  document.getElementById('csv-status').innerHTML=
    '<div style="background:#d1fae5;color:#065f46;border-radius:var(--rs);padding:14px;font-size:14px;">'+
      '<div style="font-weight:700;margin-bottom:4px;">✅ Successfully imported '+imp+' rows</div>'+extraNote+
    '</div>';
  showToast('✅ Imported '+imp+' records');
}

/* ── Create/update a recurring rule from CSV (deduplicated) ── */
function ensureRecurringRule(type,amt,cat,acc,desc,freq,startDate){
  if(!st.recurring) st.recurring=[];
  var ruleId='csv_rec_'+type+'_'+cat+'_'+acc;
  var exists=st.recurring.find(function(r){return r.id===ruleId;});
  if(!exists){
    st.recurring.push({id:ruleId,type:type,amount:amt,category:cat,account:acc,
      description:desc||cat,frequency:freq||'monthly',startDate:startDate,
      lastRun:startDate,active:true});
  }
}

function cancelCSVImport(){
  csvStagedRows=[];
  document.getElementById('csv-status').innerHTML='<div style="color:var(--muted);font-size:13px;">Import cancelled.</div>';
}

/* ── Export ── */
function exportCSV(){
  var rows=[['date','description','amount','category','account','type','to_account','recurring','frequency']];
  [...st.transactions].sort(function(a,b){return new Date(a.date)-new Date(b.date);}).forEach(function(t){
    var freq='';
    if(t.recurringId){var rule=(st.recurring||[]).find(function(r){return r.id===t.recurringId;});if(rule)freq=rule.frequency;}
    rows.push([t.date,t.description||'',t.amount,t.category,t.account,'expense','',t.recurringId?'yes':'no',freq]);
  });
  [...(st.income||[])].sort(function(a,b){return new Date(a.date)-new Date(b.date);}).forEach(function(t){
    var freq='';
    if(t.recurringId){var rule=(st.recurring||[]).find(function(r){return r.id===t.recurringId;});if(rule)freq=rule.frequency;}
    rows.push([t.date,t.description||'',t.amount,t.category,t.account,'income','',t.recurringId?'yes':'no',freq]);
  });
  [...(st.transfers||[])].sort(function(a,b){return new Date(a.date)-new Date(b.date);}).forEach(function(t){
    rows.push([t.date,t.description||'',t.amount,'Transfer',t.from,'transfer',t.to,'no','']);
  });
  var csv=rows.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='expensetrack_export.csv';
  a.click();
  showToast('✅ Exported');
}
