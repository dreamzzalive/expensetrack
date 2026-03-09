// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
function showApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app-wrap').style.display='block';
  renderDashboard(); renderSettings();
  if(typeof onAppReady==='function') onAppReady();
}
function showAuth(){
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('app-wrap').style.display='none';
}
function enterDemoMode(){ showApp(); }

function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((b,i)=>{
    b.classList.toggle('active',(tab==='login'&&i===0)||(tab==='signup'&&i===1));
  });
  document.getElementById('panel-login').style.display  = tab==='login' ?'block':'none';
  document.getElementById('panel-signup').style.display = tab==='signup'?'block':'none';
  document.getElementById('panel-reset').style.display  = tab==='reset' ?'block':'none';
}
function togglePw(id,btn){
  const i=document.getElementById(id); if(!i)return;
  const s=i.type==='password'; i.type=s?'text':'password'; btn.textContent=s?'Hide':'Show';
}

/* ── Friendly error messages covering ALL known Firebase error codes ── */
function authErr(e){
  // e can be an Error object or a raw code string
  const code = (typeof e === 'string') ? e : (e && (e.code || e.message) ? (e.code || e.message) : 'unknown');
  const map = {
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/invalid-login-credentials':'Incorrect email or password.',
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password is too weak — use at least 6 characters.',
    'auth/network-request-failed':  'Network error. Check your internet connection.',
    'auth/too-many-requests':       'Too many attempts. Please wait a few minutes.',
    'auth/user-disabled':           'This account has been disabled.',
    'auth/operation-not-allowed':   'Email/password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed.',
    'auth/unauthorized-domain':     'This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorised domains.',
    'auth/configuration-not-found': 'Firebase project not configured correctly. Check your config in js/config.js.',
    'auth/app-not-authorized':      'App not authorised. Check Firebase project settings.',
    'auth/expired-action-code':     'This link has expired. Please request a new one.',
    'auth/missing-email':           'Please enter your email address.',
    'auth/internal-error':          'An internal error occurred. Please try again.',
  };
  // Try exact match first
  if(map[code]) return map[code];
  // Try partial match (Firebase sometimes appends extra info)
  for(const key of Object.keys(map)){
    if(code.includes(key.replace('auth/',''))) return map[key];
  }
  // Fallback — show the raw code so user can report it
  return 'Sign-in error (' + code + '). Check Firebase Console for details.';
}

function setAuthBtn(btnId, loading, defaultLabel){
  const btn = document.getElementById(btnId);
  if(!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : defaultLabel;
}

/* ── Sign In ── */
async function doLogin(){
  const email = document.getElementById('a-email').value.trim();
  const pass  = document.getElementById('a-pass').value;
  const errEl = document.getElementById('a-login-err');
  errEl.textContent = '';
  if(!email || !pass){ errEl.textContent = 'Please fill in all fields.'; return; }
  if(!window._fbAuth){ errEl.textContent = 'Firebase not initialised. Check your config.js.'; return; }
  setAuthBtn('a-login-btn', true, 'Sign In');
  try {
    await window._fbAuth.signInWithEmailAndPassword(window._fbAuth.auth, email, pass);
    // onAuthStateChanged will call showApp() on success
  } catch(e) {
    console.error('Login error:', e);
    errEl.textContent = authErr(e);
  }
  setAuthBtn('a-login-btn', false, 'Sign In');
}

/* ── Sign Up ── */
async function doSignup(){
  const name  = document.getElementById('a-name').value.trim();
  const email = document.getElementById('a-semail').value.trim();
  const pass  = document.getElementById('a-spass').value;
  const pass2 = document.getElementById('a-spass2').value;
  const errEl = document.getElementById('a-signup-err');
  errEl.textContent = '';
  if(!name || !email || !pass || !pass2){ errEl.textContent = 'Please fill in all fields.'; return; }
  if(pass.length < 6){ errEl.textContent = 'Password must be at least 6 characters.'; return; }
  if(pass !== pass2){ errEl.textContent = 'Passwords do not match.'; return; }
  if(!window._fbAuth){ errEl.textContent = 'Firebase not initialised. Check your config.js.'; return; }
  setAuthBtn('a-signup-btn', true, 'Create Account');
  try {
    const cred = await window._fbAuth.createUserWithEmailAndPassword(window._fbAuth.auth, email, pass);
    await window._fbAuth.updateProfile(cred.user, {displayName: name});
    // onAuthStateChanged fires automatically — will call showApp()
  } catch(e) {
    console.error('Signup error:', e);
    errEl.textContent = authErr(e);
  }
  setAuthBtn('a-signup-btn', false, 'Create Account');
}

/* ── Password Reset ── */
async function doPasswordReset(){
  const email = document.getElementById('a-remail').value.trim();
  const errEl = document.getElementById('a-reset-err');
  const okEl  = document.getElementById('a-reset-ok');
  errEl.textContent = ''; okEl.textContent = '';
  if(!email){ errEl.textContent = 'Enter your email address.'; return; }
  if(!window._fbAuth){ errEl.textContent = 'Firebase not initialised.'; return; }
  try {
    await window._fbAuth.sendPasswordResetEmail(window._fbAuth.auth, email);
    okEl.textContent = '✅ Reset email sent! Check your inbox (and spam folder).';
  } catch(e) {
    console.error('Reset error:', e);
    errEl.textContent = authErr(e);
  }
}

/* ── Sign Out ── */
async function doLogout(){
  if(window._fbAuth){ await window._fbAuth.signOut(window._fbAuth.auth); }
  currentUser = null; st = loadLocal(); showAuth();
}

/* ── Firebase Init ── */
async function initFirebase(){
  if(!FIREBASE_READY){
    document.getElementById('demo-note').style.display = 'block';
    showAuth(); return;
  }
  try {
    const {initializeApp} = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const {getAuth, onAuthStateChanged, signInWithEmailAndPassword,
           createUserWithEmailAndPassword, updateProfile,
           sendPasswordResetEmail, signOut}
          = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const {getDatabase, ref, set, onValue}
          = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

    const app  = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db   = getDatabase(app);
    window._db    = db;
    window._fbDB  = {ref, set, onValue};
    window._fbAuth = {auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
                      updateProfile, sendPasswordResetEmail, signOut};

    onAuthStateChanged(auth, user => {
      currentUser = user;
      if(user){
        onValue(ref(db, 'users/' + user.uid + '/data'), snap => {
          if(snap.exists()){
            st = snap.val();
            if(!st.transactions)     st.transactions = [];
            if(!st.income)           st.income = [];
            if(!st.transfers)        st.transfers = [];
            if(!st.categories)       st.categories = [...DEFAULT_CATEGORIES];
            if(!st.accounts)         st.accounts = [...DEFAULT_ACCOUNTS];
            if(!st.incomeCategories) st.incomeCategories = [...DEFAULT_INCOME_CATEGORIES];
            if(!st.budgets)          st.budgets = {};
          } else {
            saveCloud();
          }
          showApp();
        });
      } else {
        st = loadLocal();
        showAuth();
      }
    });
  } catch(e) {
    console.error('Firebase init error:', e);
    // Show the actual error on screen so user knows what went wrong
    const note = document.getElementById('demo-note');
    if(note){
      note.style.display = 'block';
      note.innerHTML = '⚠️ Firebase error: <strong>' + (e.message || e) + '</strong><br>' +
        '<span onclick="enterDemoMode()" style="color:var(--primary);cursor:pointer;">Continue in demo mode →</span>';
    }
    showAuth();
  }
}
