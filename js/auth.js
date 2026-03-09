// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
function showApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app-wrap').style.display='block';
  renderDashboard(); renderSettings();
}
function showAuth(){
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('app-wrap').style.display='none';
}
function enterDemoMode(){ showApp(); }

function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((b,i)=>{ b.classList.toggle('active',(tab==='login'&&i===0)||(tab==='signup'&&i===1)); });
  document.getElementById('panel-login').style.display  = tab==='login' ?'block':'none';
  document.getElementById('panel-signup').style.display = tab==='signup'?'block':'none';
  document.getElementById('panel-reset').style.display  = tab==='reset' ?'block':'none';
}
function togglePw(id,btn){ const i=document.getElementById(id); if(!i)return; const s=i.type==='password'; i.type=s?'text':'password'; btn.textContent=s?'Hide':'Show'; }

async function doLogin(){
  const email=document.getElementById('a-email').value.trim();
  const pass =document.getElementById('a-pass').value;
  const err  =document.getElementById('a-login-err');
  err.textContent='';
  if(!email||!pass){err.textContent='Please fill in all fields.';return;}
  const btn=document.getElementById('a-login-btn'); btn.disabled=true; btn.textContent='Signing in…';
  try{ await window._fbAuth.signInWithEmailAndPassword(window._fbAuth.auth,email,pass); }
  catch(e){ err.textContent=authErr(e.code); }
  btn.disabled=false; btn.textContent='Sign In';
}
async function doSignup(){
  const name =document.getElementById('a-name').value.trim();
  const email=document.getElementById('a-semail').value.trim();
  const pass =document.getElementById('a-spass').value;
  const pass2=document.getElementById('a-spass2').value;
  const err  =document.getElementById('a-signup-err');
  err.textContent='';
  if(!name||!email||!pass||!pass2){err.textContent='Please fill in all fields.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==pass2){err.textContent='Passwords do not match.';return;}
  const btn=document.getElementById('a-signup-btn'); btn.disabled=true; btn.textContent='Creating account…';
  try{ const c=await window._fbAuth.createUserWithEmailAndPassword(window._fbAuth.auth,email,pass); await window._fbAuth.updateProfile(c.user,{displayName:name}); }
  catch(e){ err.textContent=authErr(e.code); }
  btn.disabled=false; btn.textContent='Create Account';
}
async function doPasswordReset(){
  const email=document.getElementById('a-remail').value.trim();
  document.getElementById('a-reset-err').textContent=''; document.getElementById('a-reset-ok').textContent='';
  if(!email){document.getElementById('a-reset-err').textContent='Enter your email.';return;}
  try{ await window._fbAuth.sendPasswordResetEmail(window._fbAuth.auth,email); document.getElementById('a-reset-ok').textContent='✅ Reset email sent!'; }
  catch(e){ document.getElementById('a-reset-err').textContent=authErr(e.code); }
}
async function doLogout(){
  if(window._fbAuth){ await window._fbAuth.signOut(window._fbAuth.auth); }
  currentUser=null; st=loadLocal(); showAuth();
}
function authErr(code){
  const m={'auth/user-not-found':'No account with that email.','auth/wrong-password':'Incorrect password.','auth/invalid-credential':'Incorrect email or password.','auth/email-already-in-use':'Email already in use.','auth/invalid-email':'Invalid email address.','auth/weak-password':'Password too weak (min 6 chars).','auth/network-request-failed':'Network error.','auth/too-many-requests':'Too many attempts. Try later.'};
  return m[code]||'Error: '+code;
}

async function initFirebase(){
  if(!FIREBASE_READY){
    document.getElementById('demo-note').style.display='block';
    showAuth(); return;
  }
  try {
    const {initializeApp} = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,sendPasswordResetEmail,signOut} = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const {getDatabase,ref,set,onValue} = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');
    const app  = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db   = getDatabase(app);
    window._db    = db;
    window._fbDB  = {ref,set,onValue};
    window._fbAuth= {auth,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,sendPasswordResetEmail,signOut};
    onAuthStateChanged(auth, user => {
      currentUser = user;
      if(user){
        onValue(ref(db,'users/'+user.uid+'/data'), snap => {
          if(snap.exists()){ st=snap.val(); ['transactions','income','transfers'].forEach(k=>{if(!st[k])st[k]=[];}); if(!st.categories)st.categories=[...DEFAULT_CATEGORIES]; if(!st.accounts)st.accounts=[...DEFAULT_ACCOUNTS]; if(!st.incomeCategories)st.incomeCategories=[...DEFAULT_INCOME_CATEGORIES]; }
          else { saveCloud(); }
          showApp();
        });
      } else {
        st = loadLocal(); showAuth();
      }
    });
  } catch(e) {
    console.error('Firebase failed:',e);
    showAuth();
  }
}