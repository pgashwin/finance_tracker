# Finance Tracker

A **privacy-first** personal finance web app. Track liquid funds, fixed deposits, stocks/MFs, recurring expenses, loans, insurance, PPF/PF, and assets — with an intuitive dashboard for decision-making.

**Your data never leaves your device.** All information is stored in local checkpoint files (`.ftcheckpoint`) that you explicitly save and load.

## Live Demo

After enabling GitHub Pages, the app will be available at:

`https://<username>.github.io/finance_tracker/`

## Features

- Unified dashboard: net worth, liquidity, debt ratios, EMI burden, insurance coverage
- Manual entry for all financial instrument types
- Zerodha holdings import (CSV/XLSX upload)
- Local checkpoint save/load — no cloud storage
- Works on desktop and mobile browsers
- Dark mode support

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (for the frontend)
- [uv](https://docs.astral.sh/uv/) (Python package manager for dev tooling)

### Setup

```bash
# Clone the repo
git clone https://github.com/<username>/finance_tracker.git
cd finance_tracker

# Install uv environment (creates .venv)
uv sync

# Install frontend dependencies
uv run ft-install
# or: npm install

# Start dev server
uv run ft-dev
# or: npm run dev
```

Open `http://localhost:5173/finance_tracker/` in your browser.

### Share on your local network (LAN)

Run the app so phones and other computers on the same Wi‑Fi can open it.

**Development (hot reload):**

```bash
npm run dev:lan
# or: uv run ft-dev-lan
```

**Production build (faster, closer to deployed app):**

```bash
npm run build
npm run preview:lan
# or: uv run ft-build && uv run ft-preview-lan
```

Vite prints a **Network** URL, for example:

`http://192.168.1.42:5173/finance_tracker/` (dev)  
`http://192.168.1.42:4173/finance_tracker/` (preview)

Share that URL with others on the same network. If the Network line is missing, find your PC’s IP:

```powershell
ipconfig
```

Use the **IPv4 Address** of your Wi‑Fi adapter (e.g. `192.168.1.42`).

**Notes:**

- Include the `/finance_tracker/` path in the URL.
- Allow **Node.js** through Windows Firewall when prompted (Private networks).
- Your PC must stay on and the terminal must keep running.
- Each person still loads/saves their **own** checkpoint file — data does not sync between devices.

### Build for production

```bash
uv run ft-build
# or: npm run build
```

### Run tests

```bash
uv run ft-test
# or: npm run test
```

## Using Checkpoints

1. **Load** — Click **Load** in the header and select a `.ftcheckpoint` file
2. **Add/edit** your financial data across the sidebar sections
3. **Save** — Click **Save** or **Save As** to write the checkpoint to your local folder
4. **Re-open anytime** — Load the same file on any device via the browser

> Never commit checkpoint files to git. They contain your personal financial data.

## Zerodha Import

1. Go to **Holdings** → **Import Zerodha**
2. Download your holdings report from Zerodha Console (CSV or XLSX)
3. Upload the file, preview rows, and confirm import

## GitHub Pages Deployment

1. Push to `main` branch
2. Enable **GitHub Pages** → Source: **GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` builds and deploys automatically

## Tech Stack

- React 19 + TypeScript + Vite
- Zustand (state), Zod (validation), Recharts (charts)
- Tailwind CSS
- Hosted as static SPA on GitHub Pages

## Privacy

- No backend server
- No analytics with financial data
- No localStorage persistence of financial data (session only)
- Checkpoint files are plain JSON on your filesystem

## License

MIT
