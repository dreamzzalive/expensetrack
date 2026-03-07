async function initFirebase() {
  renderSyncBanner();
  if (!FIREBASE_READY) return;
  try {
    const { initializeApp } =
      await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const {
      getAuth,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      updateProfile,
      signOut,
    } =
      await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
    const { getDatabase, ref, set, onValue } =
      await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getDatabase(app);
    window._fbDB = { ref, set, onValue, db };
    window._fbAuth = {
      auth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      updateProfile,
      signOut,
    };
    onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        onValue(ref(db, `users/${user.uid}/data`), (snap) => {
          if (snap.exists()) {
            state = snap.val();
            if (!state.transactions) state.transactions = [];
            if (!state.categories) state.categories = [...DEFAULT_CATEGORIES];
            if (!state.accounts) state.accounts = [...DEFAULT_ACCOUNTS];
          } else {
            saveCloud();
          }
          renderDashboard();
          renderSettings();
        });
      } else {
        state = loadLocal();
      }
      renderSyncBanner();
      renderDashboard();
      renderSettings();
    });
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
}
function openAuthModal() {
  document.getElementById("auth-modal").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("open");
}
function switchAuthTab(tab, btn) {
  document
    .querySelectorAll(".modal-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("auth-login-form").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("auth-signup-form").style.display =
    tab === "signup" ? "block" : "none";
}
async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;
  document.getElementById("login-err").textContent = "";
  if (!email || !pass) {
    document.getElementById("login-err").textContent =
      "Please fill all fields.";
    return;
  }
  try {
    const { auth, signInWithEmailAndPassword } = window._fbAuth;
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuthModal();
    showToast("✅ Signed in!");
  } catch (e) {
    document.getElementById("login-err").textContent = friendlyAuthError(
      e.code,
    );
  }
}
async function doSignup() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-pass").value;
  document.getElementById("signup-err").textContent = "";
  if (!name || !email || !pass) {
    document.getElementById("signup-err").textContent =
      "Please fill all fields.";
    return;
  }
  if (pass.length < 6) {
    document.getElementById("signup-err").textContent =
      "Password must be 6+ characters.";
    return;
  }
  try {
    const { auth, createUserWithEmailAndPassword, updateProfile } =
      window._fbAuth;
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    closeAuthModal();
    showToast("✅ Account created!");
  } catch (e) {
    document.getElementById("signup-err").textContent = friendlyAuthError(
      e.code,
    );
  }
}
async function doLogout() {
  if (!window._fbAuth) return;
  const { auth, signOut } = window._fbAuth;
  await signOut(auth);
  setCurrentUser(null);
  state = loadLocal();
  renderSyncBanner();
  renderDashboard();
  renderSettings();
  showToast("Signed out");
}
function friendlyAuthError(code) {
  const m = {
    "auth/user-not-found": "No account with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "Email already in use.",
    "auth/invalid-email": "Invalid email address.",
    "auth/network-request-failed": "Network error.",
  };
  return m[code] || "Something went wrong.";
}
