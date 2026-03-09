// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════
let period='month';
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function setPeriod(p,btn){ period=p; document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderAnalytics(); }
function getPeriodTxs(arr){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  if(period==='month') return (arr||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===m; });
  if(period==='year')  return (arr||[]).filter(t=>new Date(t.date).getFullYear()===y);
  return arr||[];
}
function renderAnalytics(){
  const txs=getPeriodTxs(st.transactions), inc=getPeriodTxs(st.income);
  const catE=byKey(txs,'category'),catT=catE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-cat-svg','donut-cat-leg',catE,catT,getCatColor);
  const accE=byKey(txs,'account'),accT=accE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-acc-svg','donut-acc-leg',accE,accT,getAccColor);
  const incE=byKey(inc,'category'),incT=incE.reduce((s,[,v])=>s+v,0)||1;
  donut('donut-inc-svg','donut-inc-leg',incE,incT,getIncColor);
  // trend bars
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  let labels=[],expA=[],incA=[];
  if(period==='month'){
    document.getElementById('trend-title').textContent='Daily Trend';
    const dim=new Date(y,m+1,0).getDate();
    for(let d=1;d<=dim;d++){
      const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      labels.push(d%5===0?String(d):'');
      expA.push(st.transactions.filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
      incA.push((st.income||[]).filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));
    }
  } else if(period==='year'){
    document.getElementById('trend-title').textContent='Monthly Trend';
    for(let mo=0;mo<12;mo++){
      labels.push(MONTHS[mo]);
      expA.push(st.transactions.filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
      incA.push((st.income||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===y&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
    }
  } else {
    document.getElementById('trend-title').textContent='All Time Trend';
    const allD=[...st.transactions,...(st.income||[])].map(t=>new Date(t.date));
    if(!allD.length){labels=MONTHS;expA=Array(12).fill(0);incA=Array(12).fill(0);}
    else {
      const minY=Math.min(...allD.map(d=>d.getFullYear())),maxY=Math.max(...allD.map(d=>d.getFullYear()));
      for(let yr=minY;yr<=maxY;yr++) for(let mo=0;mo<12;mo++){
        labels.push(MONTHS[mo][0]+(yr!==y?String(yr).slice(2):''));
        expA.push(st.transactions.filter(t=>{ const d=new Date(t.date); return d.getFullYear()===yr&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
        incA.push((st.income||[]).filter(t=>{ const d=new Date(t.date); return d.getFullYear()===yr&&d.getMonth()===mo; }).reduce((s,t)=>s+t.amount,0));
      }
    }
  }
  const maxA=Math.max(...expA,...incA,1);
  document.getElementById('trend-bars').innerHTML=labels.map((l,i)=>'<div class="trend-bar-col"><div style="display:flex;gap:2px;align-items:flex-end;"><div class="trend-bar-fill" style="height:'+((expA[i]/maxA)*70).toFixed(0)+'px;background:'+(expA[i]>0?'#f04a4a':'var(--border)')+';width:7px;border-radius:3px 3px 0 0;"></div><div class="trend-bar-fill" style="height:'+((incA[i]/maxA)*70).toFixed(0)+'px;background:'+(incA[i]>0?'#10b981':'var(--border)')+';width:7px;border-radius:3px 3px 0 0;"></div></div><div class="trend-bar-label">'+l+'</div></div>').join('');
  document.getElementById('trend-legend').innerHTML='<span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#f04a4a;display:inline-block"></span>Expenses</span><span style="display:flex;align-items:center;gap:5px;font-size:12px;"><span style="width:10px;height:10px;border-radius:2px;background:#10b981;display:inline-block"></span>Income</span>';
}