// Firebase config — replace with values from console.firebase.google.com
// const FIREBASE_CONFIG = {
//   apiKey:      "YOUR_API_KEY",
//   authDomain:  "YOUR_PROJECT.firebaseapp.com",
//   projectId:   "YOUR_PROJECT_ID",
//   databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxXQtg8B84LJ8ruwOLxCphWfJI_ASjxb4",
  authDomain: "myexpenses-3199d.firebaseapp.com",
  projectId: "myexpenses-3199d",
  storageBucket: "myexpenses-3199d.firebasestorage.app",
  messagingSenderId: "1046238288952",
  appId: "1:1046238288952:web:7d6cc890daa94d6c489acd",
  measurementId: "G-C7N71BW2B9",
};

const COLORS = [
  "#5b6af9",
  "#f04a4a",
  "#27ae60",
  "#f39c12",
  "#8e44ad",
  "#16a085",
  "#e67e22",
  "#2980b9",
  "#c0392b",
  "#1abc9c",
];
const EMOJIS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍",
  Health: "💊",
  Entertainment: "🎮",
  Bills: "💡",
  Others: "📦",
  Travel: "✈️",
  Education: "📚",
  Groceries: "🛒",
};
const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Bills",
  "Others",
];
const DEFAULT_ACCOUNTS = ["Cash", "DBS Debit", "OCBC Credit", "PayNow"];
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";
