import anthropic
import json
import time
import os
from dotenv import load_dotenv
load_dotenv()
from app.models.schemas import TransactionAlert, CustomerHistory, AlibiVerdict
from datetime import datetime

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

ALIBI_SYSTEM_PROMPT = """
You are the Transaction Alibi Agent — an AI defense attorney for banking transactions.

Your job is NOT to find suspicion. Your job is to build the STRONGEST POSSIBLE 
innocent explanation for a flagged transaction, using customer history and context.

You think like a defense lawyer, not a prosecutor.

For every alert, you must:
1. Find every legitimate reason this transaction could be completely normal
2. Cross-reference with customer's known patterns and history
3. Check if similar transactions exist in their history
4. Consider seasonal/lifecycle events (salary, rent, festival, property, school fees)
5. Evaluate counterparty legitimacy

Output ONLY valid JSON in this exact format (no markdown, no backticks):
{
  "verdict": "CLEARED" or "ESCALATE" or "REVIEW",
  "confidence_score": <number 0-100>,
  "alibi_summary": "<2-3 sentence innocent explanation>",
  "supporting_evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "weak_points": ["<what couldn't be explained>"],
  "investigator_note": "<focused note for human if escalated>"
}

Verdict guide:
- CLEARED (confidence 75-100): Strong innocent explanation found. Remove from queue.
- REVIEW (confidence 40-74): Partial explanation. Needs quick human check.
- ESCALATE (confidence 0-39): Cannot build strong alibi. Needs full investigation.
"""

async def run_alibi_agent(
    alert: TransactionAlert,
    history: CustomerHistory
) -> AlibiVerdict:
    
    start_time = time.time()

    user_message = f"""
ALERT TO DEFEND:
- Alert ID: {alert.alert_id}
- Customer: {alert.customer_name} (ID: {alert.customer_id})
- Account: {alert.account_number}
- Transaction: {alert.transaction_currency} {alert.transaction_amount:,.0f}
- Date: {alert.transaction_date}
- Type: {alert.transaction_type}
- Counterparty: {alert.counterparty}
- Alert Rule Triggered: {alert.alert_rule}
- System Risk Score: {alert.system_risk_score}/100
- Alert Narrative: {alert.narrative}

CUSTOMER HISTORY (use this to build the alibi):
- Average Monthly Balance: {history.transaction_currency if hasattr(history, 'transaction_currency') else 'INR'} {history.avg_monthly_balance:,.0f}
- Average Transaction Value: {history.avg_transaction_value:,.0f}
- Transaction Frequency: {history.transaction_frequency}
- Account Age: {history.account_age_years} years
- Occupation: {history.occupation}
- Known Counterparties: {', '.join(history.known_counterparties)}
- Previous Alerts: {history.previous_alerts}
- Previous SARs Filed: {history.previous_sars}

Build the strongest possible innocent explanation for this transaction.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=ALIBI_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )

    raw = response.content[0].text.strip()
    
    # Clean JSON if needed
    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    result = json.loads(raw)
    elapsed_ms = int((time.time() - start_time) * 1000)

    return AlibiVerdict(
        alert_id=alert.alert_id,
        verdict=result["verdict"],
        confidence_score=result["confidence_score"],
        alibi_summary=result["alibi_summary"],
        supporting_evidence=result["supporting_evidence"],
        weak_points=result["weak_points"],
        investigator_note=result["investigator_note"],
        processing_time_ms=elapsed_ms
    )
