# Zeko Consultancy & Construction — Website

A single-page, 3D-enhanced React website for Zeko Consultancy & Construction
(Tbilisi, Georgia). Built with React + three.js, bundled with Vite.

## Run it locally (any computer with Node.js 18+)

```bash
# 1. Unzip this folder, then open a terminal inside it
cd zeko-project

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL shown in the terminal (usually **http://localhost:5173**)
in your browser. It should open automatically.

## Build for deployment

```bash
npm run build
```

This produces a `dist/` folder containing static HTML/CSS/JS — upload the
contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, cPanel,
S3, etc.) and the site works as-is, no server/backend required.

## Project structure

```
zeko-project/
├── index.html          entry HTML file
├── package.json         dependencies & scripts
├── vite.config.js        build tool config
└── src/
    ├── main.jsx          React entry point
    └── App.jsx           the entire website (single component)
```

## Before going live — see the full documentation

Open **Zeko_Website_Documentation.docx** (included alongside this project)
for: a full section-by-section breakdown, the design rationale, and a
"before you launch" checklist (contact form wiring, real contact details,
real project data, etc.)
