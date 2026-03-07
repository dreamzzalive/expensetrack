// Firebase config — replace with values from console.firebase.google.com
const FIREBASE_CONFIG = {
  apiKey:      "YOUR_API_KEY",
  authDomain:  "YOUR_PROJECT.firebaseapp.com",
  projectId:   "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
const COLORS  = ['#5b6af9','#f04a4a','#27ae60','#f39c12','#8e44ad','#16a085','#e67e22','#2980b9','#c0392b','#1abc9c'];
const EMOJIS  = {Food:'🍔',Transport:'🚗',Shopping:'🛍',Health:'💊',Entertainment:'🎮',Bills:'💡',Others:'📦',Travel:'✈️',Education:'📚',Fitness:'🏋️'};
const DEFAULT_CATEGORIES = ['Food','Transport','Shopping','Health','Entertainment','Bills','Others'];
const DEFAULT_ACCOUNTS   = ['Cash','DBS Debit','OCBC Credit','PayNow'];
const FIREBASE_READY     = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";