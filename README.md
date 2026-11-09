# 📈 InvestTrack: Production Stock & Crypto App with Figma Token Automation

[![Deployment Status](https://shields.io)](https://stock-investment-app-mrh1.vercel.app/)
[![Figma System](https://shields.io)](https://www.figma.com/proto/uxlO9aNtkP77XavfqRRIXA/Stock-Ivestiment-App?node-id=42-33&t=LqIozkrYzPgk21RA-1&scaling=scale-down&content-scaling=fixed&page-id=16%3A177&starting-point-node-id=42%3A31)

A production-ready, full-stack reactive financial portfolio dashboard built with **ReactJS**, **Tailwind CSS 4**, and **Vite**. 

**🔗 Live Production URL:** [https://vercel.app](https://stock-investment-app-mrh1.vercel.app/)

---


A production-ready, full-stack reactive financial portfolio dashboard built with **ReactJS**, **Tailwind CSS 4**, and **Vite**. This application bridges the gap between design and production by utilizing an automated custom script pipeline that pulls and parses design tokens directly from Figma variables into utility classes.

Live market data is streamed using the **Yahoo Finance API** and **CoinGecko Engine** with automatic calculation fallback states, dual-currency toggles (ZAR/USD), user state local persistence, and native multi-theme variation blocks.

---

## 🚀 Key Architectural Features

- **Tailwind CSS v4 CSS-First Configuration:** Built entirely on the new Tailwind 4 specification, discarding legacy JavaScript setup objects for native CSS `@theme` variable injection layers.
- **Figma Design Token Bridge:** Automated synchronization with Tokens Studio/W3C specification JSON schemas using a custom structural parsing engine that filters out metadata residue.
- **Dual-Market Aggregator:** Simultaneous real-time calculation tracking for traditional equities (Vise Chart API) and local ZAR crypto assets (CoinGecko).
- **Persistent State Manifest:** Native local storage integration keeping user share inventories, added positions, and custom visual preferences secure over hard tab refreshes.
- **Multi-Theme Attribute Utilities:** Built-in transition controls for Light and Dark Modes driven directly via custom responsive typography and color tokens.
- **CI/CD Continuous Deployment Integration:** Optimized workflow configuration running automated compile steps before shipping straight to production platforms on Vercel.

---

## 🛠️ Tech Stack & Tooling

- **Framework:** React 19 (Functional Hooks & Context layers)
- **Build Engine:** Vite Bundler
- **Styling UI:** Tailwind CSS v4 (Native CSS properties mapping)
- **Charting Core:** Recharts (SVG-driven responsive sparkline curves)
- **Automation Runtime:** Node.js File System (FS) streams
- **Cloud Infrastructure:** GitHub Actions Pipelines & Vercel Global Edge Deployments

---

## 📁 Repository Directory Structure

```text
├── .github/
│   └── workflows/
│       └── sync-tokens.yml     # Automated Figma API synchronization pipeline
├── src/
│   ├── components/
│   │   ├── StockRow.jsx        # Data-reactive individual position card layout
│   │   ├── StockSparkline.jsx  # Token-mapped trend graphing engine 
│   │   └── LoadingSpinner.jsx  # Pulse animation interface guard loader
│   ├── App.jsx                 # Valuation orchestrator, inputs form, & dashboard grid
│   ├── index.css               # Main entry stylesheet hydating Tailwind v4 @theme rules
│   └── main.jsx
├── tokens.json                 # Mirrored W3C variables schema exported from Figma
├── parse-tokens.js             # Custom Node engine transforming tokens into code variables
├── package.json                # Project script shortcuts and module dependencies
└── vite.config.js              # Build parameters integrating the Tailwind compiler plugin
```

---

## 🏎️ Getting Started Locally

### 1. Clone the project and step into the workspace
```bash
git clone https://github.com
cd stock-investment-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Hydrate and compile your Figma token variables
```bash
npm run tokens
```

### 4. Fire up the local Vite hot-reloading development server
```bash
npm run dev
```

---

## 🔄 Design Tokens Automation Build Loop

The project handles visual specs via `parse-tokens.js`. When you make style updates in Figma, you can push changes instantly using our unified terminal deploy shortcut:

```bash
npm run deploy
```

**What this shortcut handles automatically:**
1. Triggers your custom compiler to read `tokens.json`.
2. Resolves token dot-notation path references (`{primitive.slate-950}`).
3. Strips opacity artifacts and builds clean namespaces (`--color-*`, `--font-*`, `--text-*`).
4. Updates `src/index.css` inside the `@theme` block.
5. Stages, commits, and pushes your fresh adjustments to GitHub, instantly triggering a Vercel production rebuild.

---

## 🔒 Environment Variable Configuration

To connect the automated cloud synchronization loop via GitHub Actions, save these variables securely inside your remote repository settings under **Settings ➔ Secrets and variables ➔ Actions**:

- `FIGMA_ACCESS_TOKEN`: Your generated Figma Personal Access Key string.
- `FIGMA_FILE_KEY`: The unique design file ID extracted from your Figma project canvas browser URL.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` file for further verification.
