// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function(){
  initFirebase();
});

// Process recurring daily
function onAppReady(){
  processRecurring();
  // Re-check every hour
  setInterval(processRecurring, 60*60*1000);
}