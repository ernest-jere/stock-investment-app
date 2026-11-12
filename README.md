# 📈 InvestTrack: Production Stock & Crypto App with Figma Token Automation

[![Deployment Status](https://shields.io)](https://stock-investment-app-mrh1.vercel.app/)
[![Figma System](https://shields.io)](https://www.figma.com/proto/uxlO9aNtkP77XavfqRRIXA/Stock-Ivestiment-App?node-id=42-33&t=LqIozkrYzPgk21RA-1&scaling=scale-down&content-scaling=fixed&page-id=16%3A177&starting-point-node-id=42%3A31)

A production-ready, full-stack reactive financial portfolio dashboard built with **ReactJS**, **Tailwind CSS 4**, and **Vite**. 

**🔗 Live Production URL:** [https://vercel.app](https://stock-investment-app-mrh1.vercel.app/)

---

## 🚀 Key Architectural Features

- **Tailwind CSS v4 CSS-First Design System:** Compiles W3C-spec design tokens directly into native CSS custom properties with seamless **Dark and Light Mode** switching.
- **Live Market Quotes & Exchange Status:** Streams real-time NYSE and dual-listed JSE ADR pricing via the **Finnhub REST API**, complete with an automatic **NYSE Open / Closed** timezone indicator and manual sync controls.
- **Dual-Currency Valuation Engine (ZAR / USD):** Fetches live USD-to-ZAR exchange rates via **Open ER-API** to dynamically recalculate unit prices, portfolio net worth, and historical trend graphs on toggle.
- **Portfolio Risk & Sector Analytics:**
  - **Systemic Risk Volatility (Beta):** Computes a dollar-weighted portfolio Beta score to classify risk posture (*Defensive*, *Market Aligned*, or *High Volatility*).
  - **Sector Allocation Bar:** Renders a proportional stacked progress bar breaking down holdings across *Technology*, *Financials*, *Retail & Consumer*, and *Mining & Energy*.
- **CSV Portfolio Ledger Export:** Generates and downloads a formatted `.csv` spreadsheet snapshot of active holdings in the user's selected currency.
- **Persistent Local State:** Preserves portfolio holdings, theme preferences, and a 7-day rolling net worth history chart in HTML5 `localStorage`.

---

## 🛠️ Tech Stack & Tooling

- **Frontend:** React 19, Vite, JavaScript (ES Modules)
- **Styling:** Tailwind CSS v4 (`@theme` & `@utility` directives)
- **Data Visualization:** Recharts (Responsive Area Charts & Sparklines)
- **Market Data APIs:** Finnhub Stock API & Open Exchange Rates API
- **Automation & CI/CD:** Node.js FS Token Parser, GitHub Actions, & Vercel

---

## 📁 Project Structure

```text
├── .github/
│   └── workflows/
│       └── sync-tokens.yml          # Automated Figma variable sync workflow
├── src/
│   ├── components/
│   │   ├── StockRow.jsx             # Individual asset card with live sparkline
│   │   ├── PortfolioHistoryChart.jsx# Rolling net worth trajectory area chart
│   │   ├── PortfolioBetaBlock.jsx   # Weighted systemic risk volatility card
│   │   ├── SectorBreakdownBar.jsx   # Proportional sector allocation bar
│   │   └── LoadingSpinner.jsx       # Loading state guard
│   ├── App.jsx                      # State orchestrator, API sync & CSV exporter
│   └── index.css                    # Compiled Tailwind v4 @theme stylesheet
├── tokens.json                      # Exported Figma design tokens schema
├── parse-tokens.js                  # Node.js token-to-CSS compiler script
└── package.json                     # Build and one-command deploy scripts
```

---

## 🏎️ Local Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Finnhub API key:
```env
VITE_FINNHUB_KEY=your_finnhub_api_key_here
```

### 3. Compile Tokens & Start Dev Server
```bash
npm run tokens
npm run dev
```

### 4. One-Command Production Deploy
```bash
npm run deploy
```

