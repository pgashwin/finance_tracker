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
- **Portfolio Chat (BYOK)** — ask questions about your finances using your own Gemini, OpenAI, or Claude API key

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

## Portfolio Chat (BYOK)

The **Chat** page lets you ask questions about your portfolio using an AI provider you configure. Your checkpoint file is never uploaded — only a summarized snapshot (net worth, ratios, allocation, top holdings, etc.) is sent with each question.

### Setup

1. Open **Settings → AI Assistant (BYOK)**
2. Enable the assistant and choose a provider preset
3. Enter your **API key** and verify the **base URL / endpoint** and **model**
4. Click **Test connection**, then go to **Chat**

### Supported providers

| Provider | Default endpoint | Get a key |
|---|---|---|
| **Google AI Studio (Gemini)** | `https://generativelanguage.googleapis.com/v1beta` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `https://api.openai.com/v1` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Anthropic (Claude)** | `https://api.anthropic.com` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| OpenRouter | `https://openrouter.ai/api/v1` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Ollama (local) | `http://localhost:11434/v1` | No key required |

Recommended Gemini models: `gemini-2.0-flash`, `gemini-2.5-flash`. OpenAI: `gpt-4o-mini`. Claude: `claude-sonnet-4-20250514`.

### Browser / CORS notes

API keys and chat history are stored in **localStorage on your device only** — not in `.ftcheckpoint` files.

- **Gemini**, **OpenRouter**, and **local Ollama** usually work from the browser.
- **OpenAI** and **Anthropic** cloud APIs may block direct browser requests (CORS). If test connection fails, use OpenRouter, Ollama, or a CORS-enabled gateway.
- For Ollama, set `OLLAMA_ORIGINS=*` before starting the server.

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
- Checkpoint files are plain JSON on your filesystem — they do **not** contain AI API keys
- Optional AI chat stores API keys and chat history in **browser localStorage only**; a portfolio summary is sent to your chosen provider when you ask a question

## License

MIT
