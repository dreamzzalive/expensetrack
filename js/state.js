// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let currentUser = null;
function defaultState(){
  return {transactions:[],categories:[...DEFAULT_CATEGORIES],accounts:[...DEFAULT_ACCOUNTS],
          income:[],incomeCategories:[...DEFAULT_INCOME_CATEGORIES],transfers:[],budgets:{},recurring:[]};
}
function loadLocal(){
  try {
    const r = localStorage.getItem('et_v4');
    if(r){ const s=JSON.parse(r); ['transactions','income','transfers'].forEach(k=>{if(!s[k])s[k]=[];}); if(!s.categories)s.categories=[...DEFAULT_CATEGORIES]; if(!s.accounts)s.accounts=[...DEFAULT_ACCOUNTS]; if(!s.incomeCategories)s.incomeCategories=[...DEFAULT_INCOME_CATEGORIES]; if(!s.budgets)s.budgets={}; if(!s.recurring)s.recurring=[]; return s; }
  } catch(e){}
  return defaultState();
}
let st = loadLocal();
function saveLocal(){ try{ localStorage.setItem('et_v4',JSON.stringify(st)); }catch(e){} }
async function saveCloud(){ if(!currentUser||!window._db)return; const{ref,set}=window._fbDB; await set(ref(window._db,'users/'+currentUser.uid+'/data'),st); }
function save(){ saveLocal(); if(currentUser) saveCloud(); }