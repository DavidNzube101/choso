# Choso

A personal bounty analysis agent for Solana and Rust developers, built on [ElizaOS](https://elizaos.github.io/eliza/) and deployed on [Nosana](https://nosana.com) decentralized GPU infrastructure.

Paste any bounty description into Telegram. Choso analyzes it against a hardcoded Rust/Solana/TypeScript developer profile and returns a match score, key requirements, effort estimate, red flags, and a go/no-go verdict — powered by Qwen3.5-27B.

## Demo

```
You:   [pastes Superteam bounty description]

Choso: **MATCH SCORE**: 92/100
       **REWARD**: 2500 USDC
       **DEADLINE**: 2 weeks
       **REQUIREMENTS**:
       - Anchor v0.30
       - SPL token swap logic
       - Bankrun tests
       **EFFORT ESTIMATE**: 4-6 days
       **RED FLAGS**: None
       **VERDICT**: GO — Strong skill match, well-scoped, competitive reward.
```

## Stack

| Layer | Technology |
|---|---|
| Agent framework | ElizaOS v1 (`@elizaos/core`) |
| LLM | Qwen3.5-27B-AWQ-4bit via Nosana Inference |
| Interface | Telegram |
| Database | SQLite |
| Runtime | Node.js 20 |
| Deployment | Nosana decentralized GPU / Docker |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/DavidNzube101/choso.git
cd choso
npm install -g pnpm
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# From nosana.com — your Qwen3.5 inference endpoint
OPENAI_API_KEY=nosana
OPENAI_API_BASE_URL=https://YOUR_NOSANA_ENDPOINT/v1

# From @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_token_here
```

### 3. Run locally

```bash
pnpm dev
```

### 4. Build for production

```bash
pnpm build
pnpm start
```

## Docker

```bash
docker build -t choso .
docker run -p 3000:3000 --env-file .env choso
```

The CI workflow (`.github/workflows/docker.yml`) automatically builds and pushes to `ghcr.io/davidnzube101/choso:latest` on every push to `main`.

## Nosana Deployment

1. Push your image to GHCR via CI
2. Edit `nos_job_def/nosana_choso_job.json` — fill in your Nosana endpoint URL and Telegram token
3. Deploy via the [Nosana dashboard](https://app.nosana.com) using the job definition

## Project Structure

```
choso/
├── src/
│   ├── index.ts                              # Agent entry point
│   ├── character.ts                          # Choso personality definition
│   └── plugin-bounty-hunter/
│       ├── index.ts                          # Plugin export
│       ├── actions/
│       │   └── analyzeBounty.ts              # Core ANALYZE_BOUNTY action
│       └── providers/
│           └── skillProfile.ts              # Rust/Solana/TS skill context
├── characters/
│   └── choso.character.json                 # Character JSON (reference)
├── nos_job_def/
│   └── nosana_choso_job.json               # Nosana job definition
├── .github/workflows/
│   └── docker.yml                           # CI — build + push to GHCR
├── Dockerfile
└── .env.example
```

## How It Works

1. You paste a bounty description into Telegram
2. ElizaOS routes the message to the `ANALYZE_BOUNTY` action (triggered when the text looks like a bounty — length + keyword heuristic)
3. The `skillProfileProvider` injects the hardcoded developer profile into the LLM context
4. Qwen3.5-27B (running on Nosana) produces a structured analysis
5. Choso returns the result in a consistent format

## License

Apache 2.0
