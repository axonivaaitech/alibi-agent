from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertStatus(str, Enum):
    PENDING = "pending"
    CLEARED = "cleared"       # Alibi agent cleared it
    ESCALATED = "escalated"   # Needs human review
    CONFIRMED_SAR = "confirmed_sar"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# --- Input Models ---

class TransactionAlert(BaseModel):
    alert_id: str
    customer_id: str
    customer_name: str
    account_number: str
    transaction_amount: float
    transaction_currency: str = "INR"
    transaction_date: str
    transaction_type: str          # wire, cash, NEFT, RTGS, UPI
    counterparty: str
    alert_rule: str                # e.g. "Large Cash Transaction", "Structuring"
    system_risk_score: int         # 0-100 from existing AML system
    narrative: str                 # Free text description of the alert

class CustomerHistory(BaseModel):
    customer_id: str
    avg_monthly_balance: float
    avg_transaction_value: float
    transaction_frequency: str     # daily/weekly/monthly
    account_age_years: float
    occupation: str
    known_counterparties: list[str]
    previous_alerts: int
    previous_sars: int

# --- Output Models ---

class AlibiVerdict(BaseModel):
    alert_id: str
    verdict: str                   # CLEARED / ESCALATE / REVIEW
    confidence_score: int          # 0-100 — how confident the alibi is
    alibi_summary: str             # 2-3 sentence innocent explanation
    supporting_evidence: list[str] # Bullet points backing the alibi
    weak_points: list[str]         # What couldn't be explained
    investigator_note: str         # What the human should focus on if escalated
    processing_time_ms: int
    created_at: datetime = datetime.now()
