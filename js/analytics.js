let analyticsPeriod='month';
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function setPeriod(p,btn){analyticsPeriod=p;document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderAnalytics();}

function renderAnalytics(){
  const txs=getAnalyticsTxs('expense');
  const incTxs=getAnalyticsTxs('income');

  // Category donut
  const bycat={};txs.forEach(t=>{bycat[t.category]=(bycat[t.category]||0)+t.amount;});
  const sortedCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const catTotal=sortedCat.reduce((s,[,v])=>s+v,0)||1;
  renderDonutChart('donut-svg-wrap','donut-legend',sortedCat,catTotal,cat=>COLORS[(state.categories||[]).indexOf(cat)%COLORS.length]);

  // Account donut
  const byacc={};txs.forEach(t=>{byacc[t.account]=(byacc[t.account]||0)+t.amount;});
  const sortedAcc=Object.entries(byacc).sort((a,b)=>b[1]-a[1]);
  const accTotal=sortedAcc.reduce((s,[,v])=>s+v,0)||1;
  renderDonutChart('donut-acc-svg-wrap','donut-acc-legend',sortedAcc,accTotal,acc=>getAccColor(acc));

  // Income donut
  const byinc={};incTxs.forEach(t=>{byinc[t.category]=(byinc[t.category]||0)+t.amount;});
  const sortedInc=Object.entries(byinc).sort((a,b)=>b[1]-a[1]);
  const incTotal=sortedInc.reduce((s,[,v])=>s+v,0)||1;
  renderDonutChart('donut-inc-svg-wrap','donut-inc-legend',sortedInc,incTotal,cat=>getIncColor(cat));

  renderTrendBars(txs, incTxs);
}

function getAnalyticsTxs(type){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  const arr=type==='income'?(state.income||[]):state.transactions;
  if(analyticsPeriod==='month')return arr.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m;});
  if(analyticsPeriod==='year')return arr.filter(t=>new Date(t.date).getFullYear()===y);
  return arr;
}

function renderDonutChart(svgId,legendId,entries,total,colorFn){
  const r=60,cx=75,cy=75,stroke=22,circ=2*Math.PI*r;
  let offset=0,paths='';
  entries.forEach(([label,amt])=>{const color=colorFn(label);const dash=amt/total*circ;paths+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${circ-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;offset+=dash;});
  if(!entries.length)paths=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e8eaf0" stroke-width="${stroke}"/>`;
  document.getElementById(svgId).innerHTML=`<svg width="150" height="150" viewBox="0 0 150 150">${paths}<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1a2e">$${entries.length?total.toFixed(0):'0'}</text></svg>`;
  document.getElementById(legendId).innerHTML=entries.map(([label,amt])=>{const color=colorFn(label);return `<div class="legend-item"><div class="legend-left"><span class="cat-dot" style="background:${color}"></span>${label}</div><div class="legend-pct">${((amt/total)*100).toFixed(1)}% · $${amt.toFixed(2)}</div></div>`;}).join('');
}

function renderTrendBars(txs,incTxs){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  let labels=[],expAmts=[],incAmts=[];
  if(analyticsPeriod==='month'){
    document.getElementById('trend-title').textContent='Daily Trend (This Month)';
    const dim=new Date(y,m+1,0).getDate();
    for(let d=1;d<=dim;d++){
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      labels.push(d%5===0?String(d):'');
      expAmts.push(state.transactions.filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
      incAmts.push((state.income||[]).filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
    }
  }else if(analyticsPeriod==='year'){
    document.getElementById('trend-title').textContent='Monthly Trend (This Year)';
    for(let mo=0;mo<12;mo++){
      labels.push(MONTHS[mo]);
      expAmts.push(state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));
      incAmts.push((state.income||[]).filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));
    }
  }else{
    document.getElementById('trend-title').textContent='Monthly Trend (All Time)';
    const all=[...state.transactions,...(state.income||[])].map(t=>new Date(t.date));
    if(!all.length){labels=MONTHS;expAmts=Array(12).fill(0);incAmts=Array(12).fill(0);}
    else{
      const minY=Math.min(...all.map(d=>d.getFullYear())),maxY=Math.max(...all.map(d=>d.getFullYear()));
      for(let yr=minY;yr<=maxY;yr++)for(let mo=0;mo<12;mo++){
        labels.push(MONTHS[mo][0]+(yr!==now.getFullYear()?yr.toString().slice(2):''));
        expAmts.push(state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===yr&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));
        incAmts.push((state.income||[]).filter(t=>{const d=new Date(t.date);return d.getFullYear()===yr&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));
      }
    }
  }
  const maxAmt=Math.max(...expAmts,...incAmts,1);
  document.getElementById('trend-bars').innerHTML=labels.map((l,i)=>`
    <div class="trend-bar-col">
      <div style="display:flex;gap:2px;align-items:flex-end;">
        <div class="trend-bar-fill" style="height:${(expAmts[i]/maxAmt*70).toFixed(0)}px;background:${expAmts[i]>0?'#f04a4a':'var(--border)'};width:8px;border-radius:3px 3px 0 0;"></div>
        <div class="trend-bar-fill" style="height:${(incAmts[i]/maxAmt*70).toFixed(0)}px;background:${incAmts[i]>0?'#10b981':'var(--border)'};width:8px;border-radius:3px 3px 0 0;"></div>
      </div>
      <div class="trend-bar-label">${l}</div>
    </div>`).join('');
  // legend
  document.getElementById('trend-legend').innerHTML=`
    <span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#f04a4a;display:inline-block"></span>Expenses</span>
    <span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#10b981;display:inline-block"></span>Income</span>`;
}
