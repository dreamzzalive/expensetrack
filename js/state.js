let state = loadLocal();
let currentUser = null;
function loadLocal(){
  const r=localStorage.getItem('expensetrack_v3');
  if(r){
    const s=JSON.parse(r);
    if(!s.income)s.income=[];
    if(!s.incomeCategories)s.incomeCategories=[...DEFAULT_INCOME_CATEGORIES];
    if(!s.transfers)s.transfers=[];
    return s;
  }
  return{transactions:[],categories:[...DEFAULT_CATEGORIES],accounts:[...DEFAULT_ACCOUNTS],income:[],incomeCategories:[...DEFAULT_INCOME_CATEGORIES],transfers:[]};
}
function saveLocal(){localStorage.setItem('expensetrack_v3',JSON.stringify(state));}
async function saveCloud(){if(!currentUser||!window._fbDB)return;const{ref,set,db}=window._fbDB;await set(ref(db,`users/${currentUser.uid}/data`),state);}
function saveState(){saveLocal();if(currentUser)saveCloud();}
function setCurrentUser(user){currentUser=user;}
