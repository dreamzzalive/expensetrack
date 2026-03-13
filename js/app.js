// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function(){
  initFirebase();
});

function onAppReady(){
  // Process any overdue recurring transactions on load
  processRecurring();
  // Re-check every hour while app is open
  setInterval(function(){
    processRecurring();
  }, 60 * 60 * 1000);
}
