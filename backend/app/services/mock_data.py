from app.models.schemas import TransactionAlert, CustomerHistory

# --- MOCK ALERTS (realistic Indian banking scenarios) ---

MOCK_ALERTS = [
    {
        "alert": TransactionAlert(
            alert_id="ALT-2026-001",
            customer_id="CUST-4521",
            customer_name="Rajesh Mehta",
            account_number="HDFC-XXXX-8821",
            transaction_amount=1200000,
            transaction_currency="INR",
            transaction_date="2026-04-10",
            transaction_type="NEFT",
            counterparty="DLF Homes Pvt Ltd",
            alert_rule="Large Wire Transfer > ₹10L",
            system_risk_score=72,
            narrative="Customer transferred ₹12L to a real estate company with no prior relationship in the system."
        ),
        "history": CustomerHistory(
            customer_id="CUST-4521",
            avg_monthly_balance=850000,
            avg_transaction_value=45000,
            transaction_frequency="weekly",
            account_age_years=8.5,
            occupation="Senior Software Engineer, Infosys",
            known_counterparties=["Amazon Pay", "HDFC Home Loan", "LIC Premium", "Zepto"],
            previous_alerts=1,
            previous_sars=0
        )
    },
    {
        "alert": TransactionAlert(
            alert_id="ALT-2026-002",
            customer_id="CUST-9034",
            customer_name="Priya Nair",
            account_number="SBI-XXXX-3301",
            transaction_amount=4800000,
            transaction_currency="INR",
            transaction_date="2026-04-08",
            transaction_type="RTGS",
            counterparty="Nair & Sons Trading Co",
            alert_rule="Structuring — 6 transactions in 3 days",
            system_risk_score=81,
            narrative="6 transactions ranging ₹70L-90L over 3 days to same beneficiary. Possible structuring."
        ),
        "history": CustomerHistory(
            customer_id="CUST-9034",
            avg_monthly_balance=3200000,
            avg_transaction_value=520000,
            transaction_frequency="daily",
            account_age_years=12.0,
            occupation="Proprietor, wholesale textile business",
            known_counterparties=["Nair & Sons Trading Co", "Tirupur Fabrics", "GST Portal", "MSME Loan EMI"],
            previous_alerts=3,
            previous_sars=0
        )
    },
    {
        "alert": TransactionAlert(
            alert_id="ALT-2026-003",
            customer_id="CUST-1187",
            customer_name="Mohammed Farooq",
            account_number="ICICI-XXXX-5512",
            transaction_amount=950000,
            transaction_currency="INR",
            transaction_date="2026-04-05",
            transaction_type="Cash Deposit",
            counterparty="SELF",
            alert_rule="Cash Deposit > ₹9L — Possible CTR Avoidance",
            system_risk_score=76,
            narrative="₹9.5L cash deposit. Customer has no regular cash activity in last 6 months."
        ),
        "history": CustomerHistory(
            customer_id="CUST-1187",
            avg_monthly_balance=180000,
            avg_transaction_value=25000,
            transaction_frequency="monthly",
            account_age_years=3.2,
            occupation="Auto-rickshaw driver, seasonal vegetable vendor",
            known_counterparties=["Jio Recharge", "LPG Booking", "School Fees - Kendriya Vidyalaya"],
            previous_alerts=0,
            previous_sars=0
        )
    },
]

def get_mock_alert(index: int = 0):
    if index < len(MOCK_ALERTS):
        return MOCK_ALERTS[index]
    return MOCK_ALERTS[0]

def get_all_mock_alerts():
    return MOCK_ALERTS
