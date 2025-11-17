# System Objective
You are rebuilding this repository (**SFTi-Pennies**) into a self-sustaining, AI-powered analytics and trading framework.  
All integrations must be serverless, GitHub-native, and rely on:
- GitHub Actions (for scheduled workflows, token refreshes, and AI orchestration)
- Python workflows and handlers (for analytics, NLP, and market data ingestion)
- GremlinGPT’s memory + tasking architecture for persistent reasoning, prompt chaining, and tokenizer-based refinement.

Your job: build full production code that aligns these components so the repo itself becomes the app.

---

# Architecture Requirements

## 1. Memory + AI Engine
- Fork `GremlinGPT` logic for `FiasMemory`, `TaskCore`, and `NLP_Engine`.
- Implement a tokenizer-based NLP engine using HuggingFace + spaCy + SentencePiece.
- Store learned state and summaries in `/memory/` with timestamped `.json` files.
- Memory triggers:
  - When user submits query via repo UI or chat workflow → run `analyze_query.py`
  - NLP Engine refines and routes the query → task → response → markdown output.
- Ensure `NLP_Engine` writes structured analysis to `/analysis/outputs/` and summarized state to `/memory/cache/`.

## 2. IBKR API Integration (HTTPS)
- Use IBKR Web API (NOT TWS or local client).
- Store encrypted API tokens using GitHub Secrets.
- Create `/ibkr_client/` with:
  - `auth.py` (handles refresh + encryption)
  - `market_data.py` (fetches tickers, quotes, positions)
  - `order_manager.py` (handles trade data sync)
- On every workflow run, validate token, refresh if expired, store securely in Actions context.

## 3. Repo-AI Chat Interface
- Define `/chat_engine/`:
  - `chat_trigger.py`: parses user prompts from Discussions, Issues, or PR comments.
  - `chat_router.py`: routes prompt → NLP → FiasMemory → analysis or IBKR → response.
  - `response_formatter.py`: formats output as professional markdown (analytics reports, trade breakdowns, summaries).

## 4. Trade Analytics Core
- Define `/analytics_core/`:
  - `trade_loader.py`: loads trades from `/data/trades/*.csv`
  - `performance_metrics.py`: computes KPIs (ROI, Sharpe, Sortino, win/loss rate)
  - `ticker_summary.py`: aggregates per-symbol stats
  - `ranking_engine.py`: ranks best/worst trades
- Analytics must auto-run when:
  - New trade file is committed
  - User requests "show best trades" / "analyze ticker TSLA"
  - Scheduled workflow triggers nightly summaries

## 5. Workflows
- `.github/workflows/ai-orchestrator.yml`: runs full pipeline (memory → NLP → analytics → response)
- `.github/workflows/token-refresh.yml`: refreshes IBKR token hourly
- `.github/workflows/db-sync.yml`: syncs and validates `/data/trades/`
- `.github/workflows/chat-handler.yml`: triggers on Issue/Discussion creation to respond with AI analytics
- Each workflow imports shared logic from `/actions_shared/` to reduce code duplication.

## 6. Security + Persistence
- Never expose tokens in logs.
- Always encrypt/decrypt with `fernet` or `PyNaCl` using GitHub Secrets.
- Store NLP and memory files under version control only if redacted/sanitized.
- Ensure workflows self-heal: if a file or cache fails, it auto-rebuilds from defaults.

---

# Developer Notes
- Maintain modularity: each Python file should import from `/core` or `/shared` paths.
- All outputs must be markdown-safe, HTML-neutral, and compatible with GitHub Pages renderers.
- Avoid hard-coded secrets or static keys; rely on Actions’ `secrets.*` injection.
- Reference `GremlinGPT` repository structure for memory, trigger, and NLP token sequencing patterns.
- Ensure functions are deterministic and idempotent.

---

# Output Expectation
Copilot must:
1. Create the full directory structure.
2. Generate initial production-ready code for each module.
3. Scaffold workflows.
4. Replace any Copilot model-calling logic with local hooks to `/chat_engine/ai_core.py`.
5. Commit with message:  
   **"feat(ai-core): integrated Gremlin-style NLP + IBKR orchestration system"**

Copilot should build, test, and validate all paths as if deployed live on GitHub Actions.
