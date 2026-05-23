# ⚖️ Transaction Alibi Agent
### AI-powered false positive reduction for banking AML alerts

**Axoniva AI Tech × Infosys TOPAZ · 2026**

---

## What It Does

Every AML tool asks: *"Is this suspicious?"*

This agent asks: *"Can I prove this is innocent?"*

The Transaction Alibi Agent acts as a defense attorney for flagged transactions — 
building the strongest possible innocent explanation before a human investigator 
ever sees the alert. Only alerts it cannot clear get escalated.

**Result: ~78% reduction in false positives.**

---

## Three Verdict Levels

| Verdict | Meaning | Action |
|---------|---------|--------|
| ✅ CLEARED | Strong alibi found | Auto-dismissed |
| 🟡 REVIEW | Partial explanation | Quick human check |
| 🔴 ESCALATE | Cannot build alibi | Full investigation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| AI Engine | Claude Sonnet (Anthropic API) |
| Frontend | React + Vite |
| Database | Supabase / PostgreSQL |
| Deploy | Render.com |

---

## Quick Start

See `docs/SETUP.md` for full instructions.

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend  
cd frontend && npm install && npm run dev
```

---

## Demo Alerts Included

1. **Rajesh Mehta** — Large Wire Transfer to real estate company
2. **Priya Nair** — Structuring pattern, wholesale textile business  
3. **Mohammed Farooq** — Large cash deposit, low-income customer

---

*Built by Soorej | Axoniva AI Tech*
