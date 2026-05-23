from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import alerts, alibi, dashboard

app = FastAPI(
    title="Transaction Alibi Agent API",
    description="AI-powered false positive reduction for banking AML alerts",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(alibi.router, prefix="/api/alibi", tags=["Alibi Agent"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"status": "Transaction Alibi Agent is running"}
