from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.schemas import TransactionAlert, CustomerHistory, AlibiVerdict
from app.services.alibi_service import run_alibi_agent
from app.services.mock_data import get_mock_alert, get_all_mock_alerts

router = APIRouter()

class AnalyzeRequest(BaseModel):
    alert: TransactionAlert
    history: CustomerHistory

@router.post("/analyze", response_model=AlibiVerdict)
async def analyze_alert(request: AnalyzeRequest):
    """Run the Alibi Agent on a transaction alert."""
    try:
        result = await run_alibi_agent(request.alert, request.history)
        return result   
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo/{index}")
async def demo_alert(index: int = 0):
    """Run Alibi Agent on a built-in demo alert. index: 0, 1, or 2."""
    try:
        mock = get_mock_alert(index)
        result = await run_alibi_agent(mock["alert"], mock["history"])
        return {
            "alert": mock["alert"],
            "history": mock["history"],
            "verdict": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo/list/all")
async def list_demo_alerts():
    """Returns all available demo alerts without running AI."""
    mocks = get_all_mock_alerts()
    return [{"index": i, "alert_id": m["alert"].alert_id,
             "customer": m["alert"].customer_name,
             "rule": m["alert"].alert_rule,
             "amount": m["alert"].transaction_amount}
            for i, m in enumerate(mocks)]