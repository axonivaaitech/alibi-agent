import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000/api";

const verdictColor = (v) => ({
  CLEARED:  { bg: "#dcfce7", text: "#166534", border: "#86efac", badge: "#16a34a" },
  REVIEW:   { bg: "#fef9c3", text: "#854d0e", border: "#fde047", badge: "#d97706" },
  ESCALATE: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", badge: "#dc2626" },
}[v] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1", badge: "#64748b" });

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
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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

function CSVUploadTab() {
  const [rows, setRows] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef();

  function parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = vals[i] || "");
      return obj;
    }).slice(0, 10);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    setCurrentIdx(-1);
    setProgress(0);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function processAll() {
    if (!rows.length) return;
    setProcessing(true);
    setResults([]);
    setCurrentIdx(0);
    const allResults = [];
    for (let i = 0; i < rows.length; i++) {
      setCurrentIdx(i);
      setProgress(Math.round(((i) / rows.length) * 100));
      const row = rows[i];
      const alertPayload = {
        alert_id: row.alert_id || `ALT-${i + 1}`,
        customer_id: `CUST-${i + 1000}`,
        customer_name: row.customer_name || "Unknown",
        account_number: row.account_number || "XXXX-0000",
        transaction_amount: parseFloat(row.amount) || 0,
        transaction_currency: "INR",
        transaction_date: new Date().toISOString().split("T")[0],
        transaction_type: row.transaction_type || "NEFT",
        counterparty: row.counterparty || "Unknown",
        alert_rule: row.alert_rule || "Suspicious Activity",
        system_risk_score: parseInt(row.risk_score) || 70,
        narrative: row.narrative || "No narrative provided",
      };
      const historyPayload = {
        customer_id: `CUST-${i + 1000}`,
        avg_monthly_balance: parseFloat(row.avg_balance) || 200000,
        avg_transaction_value: parseFloat(row.avg_balance) / 20 || 10000,
        transaction_frequency: "monthly",
        account_age_years: 3.0,
        occupation: row.occupation || "Business",
        known_counterparties: [row.counterparty || "Unknown"],
        previous_alerts: 0,
        previous_sars: 0,
      };
      try {
        const res = await fetch(`${API}/alibi/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert: alertPayload, history: historyPayload }),
        });
        const data = await res.json();
        allResults.push({ row, verdict: data, status: "done" });
      } catch (err) {
        allResults.push({ row, verdict: null, status: "error" });
      }
      setResults([...allResults]);
      await new Promise(r => setTimeout(r, 300));
    }
    setProgress(100);
    setCurrentIdx(-1);
    setProcessing(false);
  }

  function downloadResults() {
    const headers = "alert_id,customer_name,amount,alert_rule,verdict,confidence,alibi_summary";
    const rows_csv = results.map(r => {
      const v = r.verdict;
      return `${r.row.alert_id},${r.row.customer_name},${r.row.amount},${r.row.alert_rule},${v?.verdict || "ERROR"},${v?.confidence_score || 0},"${v?.alibi_summary?.replace(/"/g, "'") || "Error"}"`;
    });
    const csv = [headers, ...rows_csv].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alibi_results.csv";
    a.click();
  }

  const cleared = results.filter(r => r.verdict?.verdict === "CLEARED").length;
  const escalated = results.filter(r => r.verdict?.verdict === "ESCALATE").length;
  const review = results.filter(r => r.verdict?.verdict === "REVIEW").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "#fff", border: "2px dashed #cbd5e1", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}
        onClick={() => fileRef.current.click()}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📂</div>
        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
          {fileName ? `✅ ${fileName} loaded` : "Click to upload CSV file"}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
          Max 10 alerts · Columns: alert_id, customer_name, account_number, amount, transaction_type, counterparty, alert_rule, risk_score, narrative, occupation, avg_balance
        </div>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
      </div>

      {rows.length > 0 && !processing && results.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{rows.length} Alert{rows.length > 1 ? "s" : ""} Ready to Process</span>
            <button onClick={processAll} style={{ background: "#0d1b2a", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", color: "#e2e8f0", fontSize: "0.82rem", fontWeight: 700 }}>⚖️ Run Alibi Agent on All</button>
          </div>
          {rows.map((row, i) => (
            <div key={i} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{row.customer_name}</div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{row.alert_rule} · {row.alert_id}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>{fmtAmount(row.amount)}</div>
              <div style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>Risk: {row.risk_score}</div>
            </div>
          ))}
        </div>
      )}

      {processing && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>⚖️ Processing Alert {currentIdx + 1} of {rows.length}</span>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{progress}%</span>
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 999, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #1d4ed8, #0ea5e9)", transition: "width 0.4s ease" }} />
          </div>
          {rows[currentIdx] && (
            <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.85rem", background: "#eff6ff", borderRadius: 8, fontSize: "0.8rem", color: "#1d4ed8" }}>
              🔍 Building alibi for <strong>{rows[currentIdx].customer_name}</strong> — {rows[currentIdx].alert_rule}
            </div>
          )}
          {results.length > 0 && (
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {results.map((r, i) => {
                const col = verdictColor(r.verdict?.verdict);
                return (
                  <div key={i} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700, color: col.text }}>
                    {r.row.customer_name.split(" ")[0]}: {r.verdict?.verdict || "ERR"}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && !processing && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#16a34a" }}>{cleared}</div>
              <div style={{ fontSize: "0.7rem", color: "#166534", fontWeight: 700 }}>CLEARED</div>
            </div>
            <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#d97706" }}>{review}</div>
              <div style={{ fontSize: "0.7rem", color: "#854d0e", fontWeight: 700 }}>REVIEW</div>
            </div>
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#dc2626" }}>{escalated}</div>
              <div style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: 700 }}>ESCALATE</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={downloadResults} style={{ background: "#16a34a", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>⬇ Download Results CSV</button>
            <button onClick={() => { setRows([]); setResults([]); setFileName(""); }} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 20px", cursor: "pointer", color: "#64748b", fontSize: "0.82rem", fontWeight: 600 }}>↺ Upload New File</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {results.map((r, i) => {
              const col = verdictColor(r.verdict?.verdict);
              const isExpanded = expanded === i;
              return (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div onClick={() => setExpanded(isExpanded ? null : i)} style={{ padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
                    <div style={{ background: col.badge, color: "#fff", fontSize: "0.65rem", fontWeight: 800, padding: "3px 10px", borderRadius: 999, flexShrink: 0, letterSpacing: "0.06em" }}>{r.verdict?.verdict || "ERROR"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{r.row.customer_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{r.row.alert_rule} · {r.row.alert_id}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{fmtAmount(r.row.amount)}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{r.verdict?.confidence_score}% · {isExpanded ? "▲" : "▼"}</div>
                  </div>
                  {isExpanded && r.verdict && (
                    <div style={{ padding: "0 1.25rem 1.25rem" }}>
                      <AlibiResult result={r.verdict} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
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
    } catch {
      alert("Backend not running. Start it with: uvicorn app.main:app --reload");
    }
    setLoading(false);
  }

  const demoAlerts = [
    { index: 0, name: "Rajesh Mehta", amount: 1200000, rule: "Large Wire Transfer > ₹10L", risk: 72 },
    { index: 1, name: "Priya Nair", amount: 4800000, rule: "Structuring — 6 txns in 3 days", risk: 81 },
    { index: 2, name: "Mohammed Farooq", amount: 950000, rule: "CTR Avoidance", risk: 76 },
  ];

  const tabs = [
    { id: "queue", label: "🚨 Alert Queue" },
    { id: "demo", label: "🤖 Run Alibi Agent" },
    { id: "bulk", label: "📂 Bulk CSV Upload" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
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
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <StatCard label="Alerts Today" value={stats.total_alerts_today} />
            <StatCard label="Cleared by AI" value={stats.cleared_by_agent} sub="Auto-dismissed" accent="#16a34a" />
            <StatCard label="Escalated" value={stats.escalated_to_human} sub="Need human review" accent="#dc2626" />
            <StatCard label="Hours Saved" value={stats.hours_saved_today} sub="Today" accent="#1d4ed8" />
          </div>
        )}

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

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {tabs.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid",
              borderColor: activeTab === id ? "#1d4ed8" : "#e2e8f0",
              background: activeTab === id ? "#eff6ff" : "#fff",
              color: activeTab === id ? "#1d4ed8" : "#64748b",
              fontWeight: activeTab === id ? 700 : 500,
              cursor: "pointer", fontSize: "0.82rem",
            }}>{label}</button>
          ))}
        </div>

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
                <button onClick={() => setActiveTab("demo")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 12px", cursor: "pointer", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 700 }}>Run Alibi</button>
              </div>
            ))}
          </div>
        )}

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
                    background: loading ? "#f1f5f9" : "#0d1b2a", border: "none", borderRadius: 8,
                    padding: "6px 14px", cursor: loading ? "not-allowed" : "pointer",
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
                  <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>⚖️ Building alibi defense...</div>
                ) : (
                  <AlibiResult result={alibiResult} />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "bulk" && <CSVUploadTab />}

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.65rem", color: "#94a3b8" }}>
          Transaction Alibi Agent · Axoniva AI Tech × Infosys TOPAZ · Prototype v1.0 · 2026
        </div>
      </div>
    </div>
  );
}
