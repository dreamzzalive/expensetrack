```
expensetrack/
├── index.html          Shell: all page HTML, nav bar, auth modal
├── css/
│   └── styles.css      All styles and CSS variables
└── js/
    ├── config.js       Firebase config + app constants
    ├── state.js        Single source of truth, local + cloud save
    ├── firebase.js     Auth (login/signup/logout) + real-time sync
    ├── ui.js           Toast, nav, sync banner, txCard template
    ├── dashboard.js    Summary card, category bars, recent list
    ├── addExpense.js   Form population, validation, save
    ├── calendar.js     Month grid, day selection, tx list
    ├── analytics.js    Donut chart + trend bar chart
    ├── settings.js     User area, categories, accounts
    ├── csvHandler.js   CSV import and export
    └── app.js          Entry point bootstrap
```

## Quick Start

Open index.html in any browser. No build step needed.

## Enable Cloud Sync

1. Create free Firebase project at console.firebase.google.com
2. Enable Authentication (Email/Password) and Realtime Database
3. Paste your web app config into js/config.js
