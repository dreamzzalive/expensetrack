(function(){
  // Show demo bypass note if no Firebase configured
  if(!FIREBASE_READY){
    const note=document.getElementById('auth-demo-note');
    if(note)note.style.display='block';
  }
  initFirebase();
})();

function bypassAuth(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app-wrap').style.display='block';
  renderDashboard();
}

function togglePw(inputId,btn){
  const inp=document.getElementById(inputId);
  if(!inp)return;
  const show=inp.type==='password';
  inp.type=show?'text':'password';
  btn.textContent=show?'Hide':'Show';
}
