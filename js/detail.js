// ═══════════════════════════════════════════════════════════════
// DETAIL PAGES
// ═══════════════════════════════════════════════════════════════
let detailShowAll = false;
let detailCurrentCat = '';
let detailCurrentAcc = '';
let detailCurrentInc = '';

function openCatDetail(cat){ detailShowAll=false; detailCurrentCat=cat; _renderCatDetail(); }
function openAccDetail(acc){ detailShowAll=false; detailCurrentAcc=acc; _renderAccDetail(); }
function openIncDetail(cat){ detailShowAll=false; detailCurrentInc=cat; _renderIncDetail(); }

function toggleCatDetail(){ detailShowAll=!detailShowAll; _renderCatDetail(); }
function toggleAccDetail(){ detailShowAll=!detailShowAll; _renderAccDetail(); }
function toggleIncDetail(){ detailShowAll=!detailShowAll; _renderIncDetail(); }

function getDetailLabel(){
  return detailShowAll
    ? 'All Time'
    : dashMonth.toLocaleDateString('en-SG',{month:'long',year:'numeric'});
}
function getDetailTxs(arr){
  return detailShowAll ? (arr||[]) : getMonthTxs(arr||[], dashMonth);
}

function _renderCatDetail(){
  var cat   = detailCurrentCat;
  var color = getCatColor(cat);
  var label = getDetailLabel();
  var txs   = getDetailTxs(st.transactions).filter(function(t){ return t.category===cat; }).sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  var total = txs.reduce(function(s,t){ return s+t.amount; },0);
  var avg   = txs.length ? total/txs.length : 0;

  document.getElementById('cat-page-title').textContent = (EMOJIS[cat]||'💳')+' '+cat;
  document.getElementById('cat-page-sub').textContent   = txs.length+' transaction'+(txs.length!==1?'s':'')+' · '+label;
  var card = document.getElementById('cat-page-card');
  card.style.background = 'linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML = '<div class="label">Total Spent</div><div class="amount">$'+total.toFixed(2)+'</div><div style="font-size:13px;opacity:.85;margin-top:4px;">Avg $'+avg.toFixed(2)+' · '+label+'</div>';

  var toggleBtn = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;"><button onclick="toggleCatDetail()" style="background:'+color+'22;color:'+color+';border:1.5px solid '+color+';border-radius:99px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer;">'+(detailShowAll ? '📅 '+dashMonth.toLocaleDateString('en-SG',{month:'short',year:'numeric'})+' only' : '📋 View all time')+'</button></div>';
  document.getElementById('cat-page-list').innerHTML = toggleBtn + (txs.map(function(t){ return txCard(t,true); }).join('')||'<div class="empty-state">No transactions for '+label+'</div>');

  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('page-category').classList.add('active');
}

function _renderAccDetail(){
  var acc   = detailCurrentAcc;
  var color = getAccColor(acc);
  var label = getDetailLabel();
  var txs   = getDetailTxs(st.transactions).filter(function(t){ return t.account===acc; }).sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  var trsIn = (st.transfers||[]).filter(function(t){ return t.to===acc; });
  var totalExp = txs.reduce(function(s,t){ return s+t.amount; },0);
  var totalIn  = trsIn.reduce(function(s,t){ return s+t.amount; },0);
  var outstanding = Math.max(0, totalExp-totalIn);

  document.getElementById('acc-page-title').textContent = getAccEmoji(acc)+' '+acc;
  document.getElementById('acc-page-sub').textContent   = txs.length+' expenses · '+trsIn.length+' payments · '+label;
  var card = document.getElementById('acc-page-card');
  card.style.background = 'linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;"><div><div class="label">Total Charged</div><div class="amount">$'+totalExp.toFixed(2)+'</div></div><div><div class="label">Payments In</div><div class="amount">$'+totalIn.toFixed(2)+'</div></div></div><div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;opacity:.85;">Outstanding</span><span style="font-size:22px;font-weight:700;">'+(outstanding>0?'$'+outstanding.toFixed(2):'✅ Cleared')+'</span></div>';

  barChart(document.getElementById('acc-page-cat-chart'), byKey(txs,'category'), getCatColor);
  var allTr = (st.transfers||[]).filter(function(t){ return t.from===acc||t.to===acc; }).sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  document.getElementById('acc-page-transfers').innerHTML = allTr.map(function(t){ return trCard(t); }).join('')||'<div class="empty-state" style="padding:16px">No transfers</div>';

  var toggleBtn = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;"><button onclick="toggleAccDetail()" style="background:'+color+'22;color:'+color+';border:1.5px solid '+color+';border-radius:99px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer;">'+(detailShowAll ? '📅 '+dashMonth.toLocaleDateString('en-SG',{month:'short',year:'numeric'})+' only' : '📋 View all time')+'</button></div>';
  document.getElementById('acc-page-list').innerHTML = toggleBtn + (txs.map(function(t){ return txCard(t,true); }).join('')||'<div class="empty-state">No expenses for '+label+'</div>');

  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('page-account').classList.add('active');
}

function _renderIncDetail(){
  var cat   = detailCurrentInc;
  var color = getIncColor(cat);
  var label = getDetailLabel();
  var txs   = getDetailTxs(st.income||[]).filter(function(t){ return t.category===cat; }).sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  var total = txs.reduce(function(s,t){ return s+t.amount; },0);
  var avg   = txs.length ? total/txs.length : 0;

  document.getElementById('inc-page-title').textContent = getIncEmoji(cat)+' '+cat;
  document.getElementById('inc-page-sub').textContent   = txs.length+' record'+(txs.length!==1?'s':'')+' · '+label;
  var card = document.getElementById('inc-page-card');
  card.style.background = 'linear-gradient(135deg,'+color+','+color+'bb)';
  card.innerHTML = '<div class="label">Total Income</div><div class="amount">$'+total.toFixed(2)+'</div><div style="font-size:13px;opacity:.85;margin-top:4px;">Avg $'+avg.toFixed(2)+' · '+label+'</div>';

  var toggleBtn = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;"><button onclick="toggleIncDetail()" style="background:'+color+'22;color:'+color+';border:1.5px solid '+color+';border-radius:99px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer;">'+(detailShowAll ? '📅 '+dashMonth.toLocaleDateString('en-SG',{month:'short',year:'numeric'})+' only' : '📋 View all time')+'</button></div>';
  document.getElementById('inc-page-list').innerHTML = toggleBtn + (txs.map(function(t){ return incCard(t,true); }).join('')||'<div class="empty-state">No records for '+label+'</div>');

  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('page-income').classList.add('active');
}
