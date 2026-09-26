# ByteSense — Frontend

React + Tailwind CSS dashboard for the ByteSense deepfake detection API (`app.py`, `detector.py`,
`faces.py`, `media.py` at the repo root).

## Folder structure

```
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx           # React root, router
    ├── App.jsx            # Layout shell + routes
    ├── index.css          # Tailwind entry + base styles
    ├── api/
    │   └── client.js      # fetch() wrapper for /, /health, /analyze
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx
    │   ├── StatCard.jsx
    │   ├── TrendChart.jsx
    │   ├── RecentActivity.jsx
    │   ├── RecentScanCards.jsx
    │   ├── QuickAnalyze.jsx
    │   ├── QuickLinks.jsx
    │   └── QuoteCard.jsx
    └── pages/
        ├── Dashboard.jsx   # Home
        ├── Analyze.jsx     # Real upload + result view, wired to /analyze
        └── Placeholder.jsx # History / Reports / Settings stubs
```

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # optional — only needed if the backend isn't on localhost:10000
npm run dev
```

The dev server proxies `/api/*` to `VITE_API_URL` (default `http://127.0.0.1:10000`), so start
the Flask backend separately:

```bash
# from the repo root
flask --app app run --port 10000
```

Then open the printed Vite URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Outputs static files to `frontend/dist/`, ready to serve from any static host. Set `VITE_API_URL`
to your deployed backend origin (e.g. your Render URL) before building for production.

## Notes

- The **Home** page is a dashboard mock — the stat cards, trend chart, and recent-uploads list use
  placeholder numbers so the layout has something to show. Wire them up to real aggregates once
  you have a scan-history endpoint on the backend.
- The **Analyze** page is fully functional: it uploads to `POST /analyze`, shows the verdict,
  score, per-frame face thumbnails, and any notes exactly as `detector.py` returns them.
- Colors, verdict labels, and thresholds intentionally mirror the "Verdict guide" table in the
  project's root `README.md`.