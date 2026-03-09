/* ── Firebase + Auth ──────────────────────────────────────────────────────── */
async function initFirebase(){
  if(!FIREBASE_READY){
    // Demo mode — straight to app
    renderApp();
    return;
  }
  try{
    const{initializeApp}              = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const{getAuth,onAuthStateChanged,
          signInWithEmailAndPassword,
          createUserWithEmailAndPassword,
          updateProfile,sendPasswordResetEmail,
          signOut}                    = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const{getDatabase,ref,set,onValue}= await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

    const app  = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db   = getDatabase(app);
    window._fbDB  = {ref,set,onValue,db};
    window._fbAuth= {auth,signInWithEmailAndPassword,createUserWithEmailAndPassword,
                     updateProfile,sendPasswordResetEmail,signOut};

    onAuthStateChanged(auth, async(user)=>{
      setCurrentUser(user);
      if(user){
        // Sync from cloud
        onValue(ref(db,`users/${user.uid}/data`),(snap)=>{
          if(snap.exists()){
            state=snap.val();
            if(!state.transactions)    state.transactions=[];
            if(!state.categories)      state.categories=[...DEFAULT_CATEGORIES];
            if(!state.accounts)        state.accounts=[...DEFAULT_ACCOUNTS];
            if(!state.income)          state.income=[];
            if(!state.incomeCategories)state.incomeCategories=[...DEFAULT_INCOME_CATEGORIES];
            if(!state.transfers)       state.transfers=[];
          }else{ saveCloud(); }
          renderApp();
        });
        showMainApp();
      }else{
        showAuthScreen();
      }
    });
  }catch(e){
    console.warn('Firebase init failed:',e);
    renderApp();
  }
}

function showMainApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app-wrap').style.display='block';
  renderApp();
}
function showAuthScreen(){
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('app-wrap').style.display='none';
}
function renderApp(){
  renderDashboard();
  renderSyncBanner();
}

/* ── Auth screen tab switching ── */
function switchAuthScreenTab(tab){
  document.querySelectorAll('.auth-tab').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===tab);
  });
  document.getElementById('auth-login-panel').style.display  = tab==='login' ?'block':'none';
  document.getElementById('auth-signup-panel').style.display = tab==='signup'?'block':'none';
  document.getElementById('auth-reset-panel').style.display  = tab==='reset' ?'block':'none';
}

/* ── Sign In ── */
async function doLogin(){
  const email = document.getElementById('as-login-email').value.trim();
  const pass  = document.getElementById('as-login-pass').value;
  const errEl = document.getElementById('as-login-err');
  errEl.textContent='';
  if(!email||!pass){errEl.textContent='Please fill in all fields.';return;}
  setAuthLoading('as-login-btn',true);
  try{
    await window._fbAuth.signInWithEmailAndPassword(window._fbAuth.auth,email,pass);
  }catch(e){ errEl.textContent=friendlyAuthError(e.code); }
  setAuthLoading('as-login-btn',false);
}

/* ── Sign Up ── */
async function doSignup(){
  const name  = document.getElementById('as-signup-name').value.trim();
  const email = document.getElementById('as-signup-email').value.trim();
  const pass  = document.getElementById('as-signup-pass').value;
  const pass2 = document.getElementById('as-signup-pass2').value;
  const errEl = document.getElementById('as-signup-err');
  errEl.textContent='';
  if(!name||!email||!pass||!pass2){errEl.textContent='Please fill in all fields.';return;}
  if(pass.length<6){errEl.textContent='Password must be at least 6 characters.';return;}
  if(pass!==pass2){errEl.textContent='Passwords do not match.';return;}
  setAuthLoading('as-signup-btn',true);
  try{
    const cred=await window._fbAuth.createUserWithEmailAndPassword(window._fbAuth.auth,email,pass);
    await window._fbAuth.updateProfile(cred.user,{displayName:name});
    // update local reference so banner shows name
    if(window._fbAuth.auth.currentUser) window._fbAuth.auth.currentUser.displayName=name;
  }catch(e){ errEl.textContent=friendlyAuthError(e.code); }
  setAuthLoading('as-signup-btn',false);
}

/* ── Password Reset ── */
async function doPasswordReset(){
  const email = document.getElementById('as-reset-email').value.trim();
  const errEl = document.getElementById('as-reset-err');
  const okEl  = document.getElementById('as-reset-ok');
  errEl.textContent=''; okEl.textContent='';
  if(!email){errEl.textContent='Enter your email address.';return;}
  setAuthLoading('as-reset-btn',true);
  try{
    await window._fbAuth.sendPasswordResetEmail(window._fbAuth.auth,email);
    okEl.textContent='✅ Reset email sent! Check your inbox.';
  }catch(e){ errEl.textContent=friendlyAuthError(e.code); }
  setAuthLoading('as-reset-btn',false);
}

/* ── Sign Out ── */
async function doLogout(){
  if(!window._fbAuth)return;
  await window._fbAuth.signOut(window._fbAuth.auth);
  setCurrentUser(null);
  state=loadLocal();
  showAuthScreen();
  showToast('Signed out');
}

/* ── Helpers ── */
function setAuthLoading(btnId,loading){
  const btn=document.getElementById(btnId);
  if(!btn)return;
  btn.disabled=loading;
  btn.textContent=loading?'Please wait…':btn.dataset.label;
}
function friendlyAuthError(code){
  const m={
    'auth/user-not-found':'No account found with that email.',
    'auth/wrong-password':'Incorrect password. Try again.',
    'auth/invalid-credential':'Incorrect email or password.',
    'auth/email-already-in-use':'An account with this email already exists.',
    'auth/invalid-email':'Please enter a valid email address.',
    'auth/weak-password':'Password is too weak. Use at least 6 characters.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/too-many-requests':'Too many attempts. Please try again later.'
  };
  return m[code]||'Something went wrong ('+code+').';
}

/* ── Old modal shims (settings sign-in button still uses these) ── */
function openAuthModal(){ switchAuthScreenTab('login'); showAuthScreen(); }
function closeAuthModal(){}
function switchAuthTab(){}
