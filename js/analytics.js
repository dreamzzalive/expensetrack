let analyticsPeriod='month';
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function setPeriod(p,btn){analyticsPeriod=p;document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderAnalytics();}
function renderAnalytics(){
  const txs=getAnalyticsTxs();
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
  renderTrendBars();
}
function getAnalyticsTxs(){const now=new Date(),y=now.getFullYear(),m=now.getMonth();if(analyticsPeriod==='month')return state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m;});if(analyticsPeriod==='year')return state.transactions.filter(t=>new Date(t.date).getFullYear()===y);return state.transactions;}
function renderTrendBars(){const now=new Date(),y=now.getFullYear(),m=now.getMonth();let labels=[],amounts=[];if(analyticsPeriod==='month'){document.getElementById('trend-title').textContent='Daily Trend (This Month)';const dim=new Date(y,m+1,0).getDate();for(let d=1;d<=dim;d++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;labels.push(d%5===0?String(d):'');amounts.push(state.transactions.filter(t=>t.date===ds).reduce((s,t)=>s+t.amount,0));}}else if(analyticsPeriod==='year'){document.getElementById('trend-title').textContent='Monthly Trend (This Year)';for(let mo=0;mo<12;mo++){labels.push(MONTHS[mo]);amounts.push(state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));}}else{document.getElementById('trend-title').textContent='Monthly Trend (All Time)';const all=state.transactions.map(t=>new Date(t.date));if(!all.length){labels=MONTHS;amounts=Array(12).fill(0);}else{const minY=Math.min(...all.map(d=>d.getFullYear())),maxY=Math.max(...all.map(d=>d.getFullYear()));for(let yr=minY;yr<=maxY;yr++)for(let mo=0;mo<12;mo++){labels.push(MONTHS[mo][0]+(yr!==now.getFullYear()?yr.toString().slice(2):''));amounts.push(state.transactions.filter(t=>{const d=new Date(t.date);return d.getFullYear()===yr&&d.getMonth()===mo;}).reduce((s,t)=>s+t.amount,0));}}}const maxAmt=Math.max(...amounts,1);document.getElementById('trend-bars').innerHTML=labels.map((l,i)=>`<div class="trend-bar-col"><div class="trend-bar-fill" style="height:${(amounts[i]/maxAmt*70).toFixed(0)}px;background:${amounts[i]>0?'var(--primary)':'var(--border)'}"></div><div class="trend-bar-label">${l}</div></div>`).join('');}