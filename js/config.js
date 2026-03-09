// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:      "YOUR_API_KEY",
  authDomain:  "YOUR_PROJECT.firebaseapp.com",
  projectId:   "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";
const COLORS     = ['#5b6af9','#f04a4a','#27ae60','#f39c12','#8e44ad','#16a085','#e67e22','#2980b9','#c0392b','#1abc9c'];
const ACC_COLORS = ['#0ea5e9','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'];
const INC_COLORS = ['#10b981','#06b6d4','#3b82f6','#8b5cf6','#f59e0b','#ec4899'];
const EMOJIS     = {Food:'🍔',Transport:'🚗',Shopping:'🛍',Health:'💊',Entertainment:'🎮',Bills:'💡',Others:'📦',Travel:'✈️',Education:'📚',Fitness:'🏋️'};
const ACC_EMOJIS = {'Cash':'💵','DBS Debit':'🏦','OCBC Credit':'💳','PayNow':'📱'};
const INC_EMOJIS = {Salary:'💼',Rent:'🏠',Investments:'📈',Freelance:'💻',Business:'🏢',Others:'💰'};
const DEFAULT_CATEGORIES        = ['Food','Transport','Shopping','Health','Entertainment','Bills','Others'];
const DEFAULT_ACCOUNTS          = ['Cash','DBS Debit','OCBC Credit','PayNow'];
const DEFAULT_INCOME_CATEGORIES = ['Salary','Rent','Investments','Freelance','Business','Others'];
function getCatColor(cat){ return COLORS[(st.categories||[]).indexOf(cat)%COLORS.length]; }
function getAccColor(acc){ return ACC_COLORS[(st.accounts||[]).indexOf(acc)%ACC_COLORS.length]; }
function getIncColor(cat){ return INC_COLORS[(st.incomeCategories||DEFAULT_INCOME_CATEGORIES).indexOf(cat)%INC_COLORS.length]; }
function getAccEmoji(acc){ return ACC_EMOJIS[acc]||'💳'; }
function getIncEmoji(cat){ return INC_EMOJIS[cat]||'💰'; }