from fastapi import APIRouter

router = APIRouter()

@router.get("/queue")
async def get_alert_queue():
    """Returns mock alert queue for the dashboard."""
    return {
        "total": 3,
        "pending": 1,
        "cleared": 1,
        "escalated": 1,
        "alerts": [
            {"id": "ALT-2026-001", "customer": "Rajesh Mehta", "amount": 1200000, "rule": "Large Wire Transfer", "status": "pending"},
            {"id": "ALT-2026-002", "customer": "Priya Nair", "amount": 4800000, "rule": "Structuring", "status": "pending"},
            {"id": "ALT-2026-003", "customer": "Mohammed Farooq", "amount": 950000, "rule": "CTR Avoidance", "status": "pending"},
        ]
    }
