# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run locally (web - recommended):**
```bash
python3 -m http.server 4173
# Open http://127.0.0.1:4173/
```

**Run locally (Electron):**
```bash
npm install
npm run dev
```

**Build macOS DMG installer:**
```bash
npm run dist
# Output: dist/RoadMap-*.dmg (arm64)
```

There are no tests, no linting, and no type checking configured.

## Architecture

This is a **monolithic single-page React app** that runs entirely in the browser via CDN-loaded libraries (no bundler). JSX is transpiled at runtime by Babel Standalone. The same files are served both as a web app and packaged in an Electron shell.

**Key files:**
- [index.html](index.html) — Entry point; loads React, ReactDOM, Babel, Tailwind, and Lucide via CDN, then imports the JSX component as a script tag
- [evolution_roadmap_pro.jsx](evolution_roadmap_pro.jsx) — The entire application: all state, business logic, and UI in one ~1200-line React component
- [main.js](main.js) — Electron main process; opens a BrowserWindow pointed at `index.html` with context isolation and sandbox enabled
- [package.json](package.json) — Only has `dist` script; no dev server script (use Python for local dev)

**Data model** (all in-memory, no persistence):
```
INITIAL_DATA = {
  startYear, startMonth,
  projects: [{ id, name, start, end, color, subProjects: [...] }],
  products: [{ id, name, color, versions: [{ id, name, date, features: [...] }] }],
  feedbacks: [{ id, versionId, projectId, subProjectId, deliveryScope, deliveryQuality, deliveryDate }]
}
```

**UI layout:**
- **Left sidebar (420px)**: Three-tab config panel — Projects, Products, Feedbacks
- **Top header**: Timeline scale toggle (week/month), zoom slider, filter dropdowns, focus mode, SVG export
- **Main canvas**: Scrollable SVG-based Gantt/timeline. Project rows at top, product version rows at bottom, curved Bezier arrows connecting feedbacks between them

**Rendering**: The timeline visualization is pure SVG (no canvas or charting library). Sticky headers are implemented with SVG `transform` offsets driven by scroll event listeners.

**State**: Single `useState` holding the entire `data` object; mutations go through an `updateData()` helper that shallow-merges at the top level.

## Important Constraints

- All UI text is in Chinese (简体中文). Keep any added text in Chinese.
- The app has **no build step** — changes to `.jsx` are immediately reflected when reloaded in the browser.
- The Electron `files` array in `package.json` must include any new source files for the DMG build to include them.
- The `identity: null` setting in `package.json` disables code signing — required for unsigned local builds on macOS.
