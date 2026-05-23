from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
async def get_stats():
    return {
        "total_alerts_today": 47,
        "cleared_by_agent": 38,
        "escalated_to_human": 9,
        "false_positive_rate_before": 85,
        "false_positive_rate_after": 19,
        "hours_saved_today": 14.2,
        "avg_processing_time_ms": 1840
    }
