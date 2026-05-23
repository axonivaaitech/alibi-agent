import { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

const verdictColor = (v) => ({
  CLEARED:  { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  REVIEW:   { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  ESCALATE: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
}[v] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" });

const fmtAmount = (n) => "₹" + Number(n).toLocaleString("en-IN");

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: accent || "#0f172a", lineHeight: 1.2, marginTop: "0.25rem" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

function AlibiResult({ result }) {
  if (!result) return null;
  const colors = verdictColor(result.verdict);
  return (
    <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: colors.text }}>{result.verdict}</span>
          <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: colors.text }}>Confidence: {result.confidence_score}%</span>
        </div>
        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Processed in {result.processing_time_ms}ms</span>
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.85rem 1rem" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Alibi Summary</div>
        <p style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.7, margin: 0 }}>{result.alibi_summary}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.75rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Supporting Evidence</div>
          {result.supporting_evidence.map((e, i) => (
            <div key={i} style={{ fontSize: "0.78rem", color: "#14532d", marginBottom: "0.25rem" }}>✓ {e}</div>
          ))}
        </div>
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "0.75rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Weak Points</div>
          {result.weak_points.map((w, i) => (
            <div key={i} style={{ fontSize: "0.78rem", color: "#7c2d12", marginBottom: "0.25rem" }}>⚠ {w}</div>
          ))}
        </div>
      </div>

      {result.verdict !== "CLEARED" && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.75rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Investigator Note</div>
          <div style={{ fontSize: "0.8rem", color: "#1e40af" }}>{result.investigator_note}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alibiResult, setAlibiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    fetch(`${API}/dashboard/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/alerts/queue`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {});
  }, []);

  async function runAlibi(index) {
    setLoading(true);
    setAlibiResult(null);
    try {
      const res = await fetch(`${API}/alibi/demo/${index}`);
      const data = await res.json();
      setSelectedAlert(data);
      setAlibiResult(data.verdict);
    } catch (e) {
      alert("Backend not running. Start it with: uvicorn app.main:app --reload");
    }
    setLoading(false);
  }

  const demoAlerts = [
    { index: 0, name: "Rajesh Mehta", amount: 1200000, rule: "Large Wire Transfer > ₹10L", risk: 72 },
    { index: 1, name: "Priya Nair", amount: 4800000, rule: "Structuring — 6 txns in 3 days", risk: 81 },
    { index: 2, name: "Mohammed Farooq", amount: 950000, rule: "CTR Avoidance", risk: 76 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0d1b2a", borderBottom: "1px solid #1e3a5f", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 32, height: 32, background: "#1d4ed8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚖️</div>
        <div>
          <div style={{ fontWeight: 800, color: "#e2e8f0", fontSize: "1rem" }}>Transaction Alibi Agent</div>
          <div style={{ fontSize: "0.65rem", color: "#475569" }}>Infosys TOPAZ · AML False Positive Reduction · v1.0</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ color: "#22c55e", fontSize: "0.7rem", fontWeight: 700 }}>AGENT LIVE</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <StatCard label="Alerts Today" value={stats.total_alerts_today} />
            <StatCard label="Cleared by AI" value={stats.cleared_by_agent} sub="Auto-dismissed" accent="#16a34a" />
            <StatCard label="Escalated" value={stats.escalated_to_human} sub="Need human review" accent="#dc2626" />
            <StatCard label="Hours Saved" value={stats.hours_saved_today} sub="Today" accent="#1d4ed8" />
          </div>
        )}

        {/* FP Rate Banner */}
        {stats && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#dc2626" }}>{stats.false_positive_rate_before}%</div>
              <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>FP Rate Before</div>
            </div>
            <div style={{ fontSize: "1.5rem", color: "#94a3b8" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#16a34a" }}>{stats.false_positive_rate_after}%</div>
              <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>FP Rate After</div>
            </div>
            <div style={{ flex: 1, paddingLeft: "1rem", borderLeft: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>Alibi Agent reduces false positives by ~78%</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>Investigators only see alerts the AI could not clear</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {[["queue", "🚨 Alert Queue"], ["demo", "🤖 Run Alibi Agent"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid",
              borderColor: activeTab === id ? "#1d4ed8" : "#e2e8f0",
              background: activeTab === id ? "#eff6ff" : "#fff",
              color: activeTab === id ? "#1d4ed8" : "#64748b",
              fontWeight: activeTab === id ? 700 : 500, cursor: "pointer", fontSize: "0.82rem",
            }}>{label}</button>
          ))}
        </div>

        {/* Alert Queue Tab */}
        {activeTab === "queue" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
              Pending Alert Queue — {alerts.length} alerts
            </div>
            {alerts.map((a, i) => (
              <div key={a.id} style={{ padding: "0.85rem 1.25rem", borderBottom: i < alerts.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{a.customer}</div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{a.rule} · {a.id}</div>
                </div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>{fmtAmount(a.amount)}</div>
                <button onClick={() => setActiveTab("demo")} style={{
                  background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6,
                  padding: "4px 12px", cursor: "pointer", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 700,
                }}>Run Alibi</button>
              </div>
            ))}
          </div>
        )}

        {/* Demo Tab */}
        {activeTab === "demo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
                Select Alert — Click to run Alibi Agent
              </div>
              {demoAlerts.map((a) => (
                <div key={a.index} style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{a.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{a.rule}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{fmtAmount(a.amount)}</div>
                  <div style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>Risk: {a.risk}</div>
                  <button onClick={() => runAlibi(a.index)} disabled={loading} style={{
                    background: loading ? "#f1f5f9" : "#0d1b2a", border: "none",
                    borderRadius: 8, padding: "6px 14px", cursor: loading ? "not-allowed" : "pointer",
                    color: loading ? "#94a3b8" : "#e2e8f0", fontSize: "0.78rem", fontWeight: 700,
                  }}>
                    {loading ? "⚙ Running..." : "⚖️ Build Alibi"}
                  </button>
                </div>
              ))}
            </div>

            {(loading || alibiResult) && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {selectedAlert?.alert?.customer_name} — {selectedAlert?.alert?.alert_rule}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{selectedAlert?.alert?.alert_id} · {fmtAmount(selectedAlert?.alert?.transaction_amount)}</div>
                {loading ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                    ⚖️ Building alibi defense...
                  </div>
                ) : (
                  <AlibiResult result={alibiResult} />
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.65rem", color: "#94a3b8" }}>
          Transaction Alibi Agent · Axoniva AI Tech × Infosys TOPAZ · Prototype v1.0 · 2026
        </div>
      </div>
    </div>
  );
}