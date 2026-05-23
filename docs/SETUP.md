# Transaction Alibi Agent — Setup Guide
# Run this file step by step on your laptop

# ════════════════════════════════════════════════
# STEP 1 — FOLDER STRUCTURE (already created)
# ════════════════════════════════════════════════
# alibi-agent/
# ├── backend/
# │   ├── app/
# │   │   ├── main.py              ← FastAPI app entry point
# │   │   ├── models/schemas.py    ← Data models
# │   │   ├── routes/alibi.py      ← Alibi agent API endpoints
# │   │   ├── routes/alerts.py     ← Alert queue endpoints
# │   │   ├── routes/dashboard.py  ← Stats endpoints
# │   │   └── services/
# │   │       ├── alibi_service.py ← Claude AI logic (THE BRAIN)
# │   │       └── mock_data.py     ← Sample banking alerts
# │   ├── requirements.txt
# │   └── .env.example
# └── frontend/
#     └── src/
#         └── App.jsx              ← React dashboard


# ════════════════════════════════════════════════
# STEP 2 — BACKEND SETUP (Terminal 1)
# ════════════════════════════════════════════════

cd alibi-agent/backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
copy .env.example .env
# Open .env and add your ANTHROPIC_API_KEY

# Create empty __init__.py files so Python recognizes folders
echo. > app/__init__.py
echo. > app/models/__init__.py
echo. > app/routes/__init__.py
echo. > app/services/__init__.py

# Run the backend
uvicorn app.main:app --reload --port 8000

# You should see:
# INFO: Uvicorn running on http://127.0.0.1:8000
# Open http://localhost:8000/docs to see all API endpoints


# ════════════════════════════════════════════════
# STEP 3 — FRONTEND SETUP (Terminal 2)
# ════════════════════════════════════════════════

cd alibi-agent/frontend

# Create React app (if not already done)
npm create vite@latest . -- --template react
# When asked: select React, then JavaScript

# Install dependencies
npm install

# Replace the src/App.jsx with the one we created
# (already done — just make sure the file is there)

# Start frontend
npm run dev

# Open http://localhost:5173 in your browser


# ════════════════════════════════════════════════
# STEP 4 — TEST IT
# ════════════════════════════════════════════════

# Option A: Use the web dashboard at http://localhost:5173
# Click any alert → "Build Alibi" → See AI verdict

# Option B: Test backend directly
# Open http://localhost:8000/docs
# Try GET /api/alibi/demo/0  (Rajesh Mehta case)
# Try GET /api/alibi/demo/1  (Priya Nair case)
# Try GET /api/alibi/demo/2  (Mohammed Farooq case)


# ════════════════════════════════════════════════
# STEP 5 — DEPLOY TO RENDER (when ready)
# ════════════════════════════════════════════════

# Backend:
# 1. Push to GitHub
# 2. Go to render.com → New Web Service
# 3. Connect GitHub repo
# 4. Build command: pip install -r requirements.txt
# 5. Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
# 6. Add environment variable: ANTHROPIC_API_KEY

# Frontend:
# 1. Update API url in App.jsx from localhost to your Render backend URL
# 2. Deploy frontend to Vercel or Render Static Site
