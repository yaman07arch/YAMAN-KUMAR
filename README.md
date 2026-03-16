# ProDoctor Record Management

A lightweight single-page app (SPA) for tracking doctors, patients, and treatment outcomes.

## ✅ Domain-ready Features
- Uses **hash-based routing** (works with static hosting)
- Includes **PWA metadata** (`manifest.json`, `favicon.svg`, `theme-color`)
- Supports **clean URL fallback** for Express-based hosting
- Uses **relative asset paths** (works from root or subfolders)

## 📦 Running Locally (Node)
1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Visit:

```
http://localhost:5000
```

## 🚀 Deploying to a Custom Domain
### Option A: Static Host (Netlify, Vercel, GitHub Pages)
Just deploy the contents of this folder (including `index.html`, `style.css`, `script.js`). No backend required.

### Option B: Node/Express Host (Heroku, Render, DigitalOcean)
Deploy the repo and ensure `PORT` is set by the host. The server includes a fallback route so client-side routing works.

## 🧠 Notes
- The app stores patient/doctor data in **localStorage**, so data stays in your browser unless cleared.
- The optional `server.js` includes a **MongoDB API** but the frontend currently uses local storage.
