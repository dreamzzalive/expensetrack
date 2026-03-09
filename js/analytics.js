// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let period = 'month';
// For month view: which year/month are we browsing
let anaYear  = new Date().getFullYear();
let anaMonth = new Date().getMonth();   // 0-indexed
// For year view: which year
let anaYearSel = new Date().getFullYear();

/* ── Called by nav tabs ── */
function setPeriod(p, btn){
  period = p;
  document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAnalytics();
}

/* ── Month nav (month view) ── */
function anaChangeMonth(d){
  anaMonth += d;
  if(anaMonth > 11){ anaMonth = 0;  anaYear++; }
  if(anaMonth < 0) { anaMonth = 11; anaYear--; }
  renderAnalytics();
}

/* ── Year nav (year view) ── */
function anaChangeYear(d){
  anaYearSel += d;
  renderAnalytics();
}

/* ── Filter helpers ── */
function getTxsForMonth(arr, y, m){ return (arr||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y && d.getMonth()===m; }); }
function getTxsForYear(arr, y)    { return (arr||[]).filter(t=> new Date(t.date).getFullYear()===y); }

/* ── Main render ── */
function renderAnalytics(){
  const wrap = document.getElementById('analytics-nav-wrap');
  if(!wrap) return;

  if(period === 'month'){
    // Month navigator
    wrap.innerHTML =
      '<div class="ana-nav-row">' +
        '<button class="icon-btn" onclick="anaChangeMonth(-1)">&#8249;</button>' +
        '<span style="font-weight:700;font-size:15px;">' + MONTHS[anaMonth] + ' ' + anaYear + '</span>' +
        '<button class="icon-btn" onclick="anaChangeMonth(1)">&#8250;</button>' +
      '</div>';

    const txs = getTxsForMonth(st.transactions, anaYear, anaMonth);
    const inc = getTxsForMonth(st.income||[], anaYear, anaMonth);
    renderDonutSection(txs, inc);

    // Daily trend bars
    const dim = new Date(anaYear, anaMonth+1, 0).getDate();
    const labels=[], expA=[], incA=[];
    for(let d=1; d<=dim; d++){
      const ds = anaYear+'-'+String(anaMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      labels.push(d%5===0 ? String(d) : '');
      expA.push(txs.filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
      incA.push(inc.filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
    }
    document.getElementById('trend-title').textContent = 'Daily Trend — ' + MONTHS[anaMonth];
    renderTrendBars(labels, expA, incA);
    hideCatByMonth(); // hide monthly-category chart in month view

  } else if(period === 'year'){
    // Year navigator
    wrap.innerHTML =
      '<div class="ana-nav-row">' +
        '<button class="icon-btn" onclick="anaChangeYear(-1)">&#8249;</button>' +
        '<span style="font-weight:700;font-size:15px;">' + anaYearSel + '</span>' +
        '<button class="icon-btn" onclick="anaChangeYear(1)">&#8250;</button>' +
      '</div>';

    const txs = getTxsForYear(st.transactions, anaYearSel);
    const inc = getTxsForYear(st.income||[], anaYearSel);
    renderDonutSection(txs, inc);

    // Monthly trend
    const labels=[], expA=[], incA=[];
    for(let mo=0; mo<12; mo++){
      labels.push(MONTHS[mo]);
      expA.push(txs.filter(t=>new Date(t.date).getMonth()===mo).reduce((s,t)=>s+t.amount,0));
      incA.push(inc.filter(t=>new Date(t.date).getMonth()===mo).reduce((s,t)=>s+t.amount,0));
    }
    document.getElementById('trend-title').textContent = 'Monthly Trend — ' + anaYearSel;
    renderTrendBars(labels, expA, incA);

    // Category by month stacked bars
    renderCatByMonth(anaYearSel);

  } else {
    // All time — no nav
    wrap.innerHTML = '';
    const txs = st.transactions || [];
    const inc = st.income || [];
    renderDonutSection(txs, inc);

    // All-time trend
    const allD = [...txs, ...inc].map(t => new Date(t.date));
    const labels=[], expA=[], incA=[];
    if(!allD.length){
      MONTHS.forEach(m=>{ labels.push(m); expA.push(0); incA.push(0); });
    } else {
      const minY = Math.min(...allD.map(d=>d.getFullYear()));
      const maxY = Math.max(...allD.map(d=>d.getFullYear()));
      for(let yr=minY; yr<=maxY; yr++) for(let mo=0; mo<12; mo++){
        labels.push(MONTHS[mo][0]+String(yr).slice(2));
        expA.push(txs.filter(t=>{ const d=new Date(t.date); return d.getFullYear()===yr&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
        incA.push(inc.filter(t=>{ const d=new Date(t.date); return d.getFullYear()===yr&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
      }
    }
    document.getElementById('trend-title').textContent = 'All Time Trend';
    renderTrendBars(labels, expA, incA);
    hideCatByMonth();
  }
}

/* ── Donut charts (shared) ── */
function renderDonutSection(txs, inc){
  const catE=byKey(txs,'category'), catT=catE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-cat-svg','donut-cat-leg', catE, catT, getCatColor);
  const accE=byKey(txs,'account'),  accT=accE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-acc-svg','donut-acc-leg', accE, accT, getAccColor);
  const incE=byKey(inc,'category'), incT=incE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-inc-svg','donut-inc-leg', incE, incT, getIncColor);
}

/* ── Trend bars ── */
function renderTrendBars(labels, expA, incA){
  const maxA = Math.max(...expA, ...incA, 1);
  document.getElementById('trend-bars').innerHTML = labels.map((l,i) =>
    '<div class="trend-bar-col">' +
      '<div style="display:flex;gap:2px;align-items:flex-end;">' +
        '<div class="trend-bar-fill" style="height:'+((expA[i]/maxA)*70).toFixed(0)+'px;background:'+(expA[i]>0?'#f04a4a':'var(--border)')+';width:7px;border-radius:3px 3px 0 0;"></div>' +
        '<div class="trend-bar-fill" style="height:'+((incA[i]/maxA)*70).toFixed(0)+'px;background:'+(incA[i]>0?'#10b981':'var(--border)')+';width:7px;border-radius:3px 3px 0 0;"></div>' +
      '</div>' +
      '<div class="trend-bar-label">'+l+'</div>' +
    '</div>'
  ).join('');
  document.getElementById('trend-legend').innerHTML =
    '<span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#f04a4a;display:inline-block"></span>Expenses</span>' +
    '<span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#10b981;display:inline-block"></span>Income</span>';
}

/* ── Category by Month chart (year view only) ── */
function renderCatByMonth(yr){
  const wrap = document.getElementById('cat-by-month-wrap');
  if(!wrap) return;
  wrap.style.display = 'block';

  const cats   = st.categories || DEFAULT_CATEGORIES;
  const txsYr  = getTxsForYear(st.transactions, yr);
  // Build data: cats × 12 months
  const data = cats.map(cat => MONTHS.map((_,mo) =>
    txsYr.filter(t => t.category===cat && new Date(t.date).getMonth()===mo).reduce((s,t)=>s+t.amount,0)
  ));
  // Only show cats that have any spend this year
  const activeCats = cats.filter((_,ci) => data[ci].some(v=>v>0));
  const activeData = data.filter((_,ci) => cats.filter((_,ci2)=>data[ci2].some(v=>v>0)).includes(cats[ci]) && data[ci].some(v=>v>0));

  if(!activeCats.length){
    wrap.innerHTML = '<div class="trend-card"><h3>Category Trend — '+yr+'</h3><div class="empty-state">No data for '+yr+'</div></div>';
    return;
  }

  // Monthly totals per category — grouped bar chart
  const maxVal = Math.max(...activeData.flat(), 1);
  const barW   = Math.max(6, Math.floor(240 / (12 * (activeCats.length+1))));

  let html = '<div class="trend-card"><h3>Category Spend by Month — '+yr+'</h3>';
  // Legend
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px 14px;margin-bottom:12px;">' +
    activeCats.map(c => '<span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:'+getCatColor(c)+';display:inline-block"></span>'+c+'</span>').join('') +
  '</div>';
  // Bars
  html += '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding-bottom:20px;min-width:320px;">';
  for(let mo=0; mo<12; mo++){
    html += '<div style="display:flex;flex-direction:column;align-items:center;flex:1;">' +
              '<div style="display:flex;gap:2px;align-items:flex-end;height:90px;">';
    activeCats.forEach((cat,ci)=>{
      const v = activeData[ci][mo];
      const h = v>0 ? Math.max(3, Math.round((v/maxVal)*82)) : 0;
      html += '<div title="'+cat+': $'+v.toFixed(0)+'" style="width:'+barW+'px;height:'+h+'px;background:'+getCatColor(cat)+';border-radius:3px 3px 0 0;cursor:default;"></div>';
    });
    html += '</div><div style="font-size:10px;color:var(--muted);margin-top:3px;">'+MONTHS[mo]+'</div></div>';
  }
  html += '</div></div></div>';
  wrap.innerHTML = html;
}

function hideCatByMonth(){
  const wrap = document.getElementById('cat-by-month-wrap');
  if(wrap) wrap.style.display = 'none';
}
