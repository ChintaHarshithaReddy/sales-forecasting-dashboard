import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Circle } from "lucide-react";

// ---------- Design tokens ----------
const T = {
  bg: "#0F1419",
  surface: "#161D27",
  surfaceRaised: "#1C2531",
  border: "#2A323D",
  borderFaint: "#212933",
  textPrimary: "#E8ECF1",
  textMuted: "#8B96A5",
  textFaint: "#5C6674",
  actual: "#4FD1C5",
  actualDim: "#2C6B65",
  forecast: "#F0B429",
  forecastDim: "#7A5C1E",
  negative: "#E5687A",
  positive: "#4FD1C5",
};

// ---------- Sample data ----------
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
];

// 12 months actual, 6 months forecast, with a widening confidence band
const revenueData = [
  { m: "Jan", actual: 412, forecast: null, low: null, high: null },
  { m: "Feb", actual: 438, forecast: null, low: null, high: null },
  { m: "Mar", actual: 401, forecast: null, low: null, high: null },
  { m: "Apr", actual: 465, forecast: null, low: null, high: null },
  { m: "May", actual: 492, forecast: null, low: null, high: null },
  { m: "Jun", actual: 478, forecast: null, low: null, high: null },
  { m: "Jul", actual: 521, forecast: null, low: null, high: null },
  { m: "Aug", actual: 507, forecast: null, low: null, high: null },
  { m: "Sep", actual: 549, forecast: null, low: null, high: null },
  { m: "Oct", actual: 566, forecast: null, low: null, high: null },
  { m: "Nov", actual: 588, forecast: null, low: null, high: null },
  { m: "Dec", actual: 612, forecast: 612, low: 612, high: 612 },
  { m: "Jan", actual: null, forecast: 634, low: 610, high: 658 },
  { m: "Feb", actual: null, forecast: 651, low: 612, high: 690 },
  { m: "Mar", actual: null, forecast: 668, low: 610, high: 726 },
  { m: "Apr", actual: null, forecast: 693, low: 617, high: 769 },
  { m: "May", actual: null, forecast: 715, low: 618, high: 812 },
  { m: "Jun", actual: null, forecast: 742, low: 622, high: 862 },
];

const pipelineStages = [
  { stage: "Prospecting", value: 2840, count: 146, color: "#3A4657" },
  { stage: "Qualified", value: 1920, count: 82, color: "#4C5C73" },
  { stage: "Proposal", value: 1180, count: 41, color: "#5B7FA6" },
  { stage: "Negotiation", value: 640, count: 19, color: "#4FD1C5" },
  { stage: "Closing", value: 310, count: 8, color: "#F0B429" },
];

const regions = [
  { region: "AMER", value: 268, target: 250 },
  { region: "EMEA", value: 194, target: 210 },
  { region: "APAC", value: 156, target: 140 },
  { region: "LATAM", value: 84, target: 90 },
];

const topDeals = [
  { name: "Meridian Health Systems", stage: "Negotiation", value: 128000, prob: 72, close: "Jul 18" },
  { name: "Kestrel Logistics Co.", stage: "Proposal", value: 96500, prob: 55, close: "Jul 24" },
  { name: "Northlake Manufacturing", stage: "Closing", value: 84200, prob: 90, close: "Jul 14" },
  { name: "Verdant Retail Group", stage: "Negotiation", value: 71800, prob: 68, close: "Aug 02" },
  { name: "Solace Financial", stage: "Proposal", value: 59300, prob: 45, close: "Aug 09" },
];

const fmtK = (n) => (n == null ? "" : `$${n.toLocaleString()}K`);
const fmtCurrency = (n) => `$${(n / 1000).toFixed(0)}K`;

// ---------- Custom tooltip ----------
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const actual = payload.find((p) => p.dataKey === "actual")?.value;
  const forecast = payload.find((p) => p.dataKey === "forecast")?.value;
  const low = payload.find((p) => p.dataKey === "low")?.value;
  const high = payload.find((p) => p.dataKey === "high")?.value;
  return (
    <div
      style={{
        background: T.surfaceRaised,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: "10px 12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: T.textPrimary,
        minWidth: 140,
      }}
    >
      <div style={{ color: T.textFaint, marginBottom: 6, fontSize: 10, letterSpacing: 1 }}>
        {label.toUpperCase()}
      </div>
      {actual != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: T.actual }}>Actual</span>
          <span>{fmtK(actual)}</span>
        </div>
      )}
      {forecast != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: T.forecast }}>Forecast</span>
          <span>{fmtK(forecast)}</span>
        </div>
      )}
      {low != null && high != null && low !== high && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: T.textFaint, marginTop: 2 }}>
          <span>Range</span>
          <span>{fmtK(low)}–{fmtK(high)}</span>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, delta, deltaLabel, positive = true, accent }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          color: T.textFaint,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 28,
          fontWeight: 600,
          color: T.textPrimary,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {positive ? (
          <ArrowUpRight size={14} color={accent || T.positive} />
        ) : (
          <ArrowDownRight size={14} color={T.negative} />
        )}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: positive ? accent || T.positive : T.negative,
          }}
        >
          {delta}
        </span>
        <span style={{ fontSize: 12, color: T.textFaint }}>{deltaLabel}</span>
      </div>
    </div>
  );
}

export default function SalesForecastDashboard() {
  const [period, setPeriod] = useState("18mo");

  const totalPipeline = useMemo(
    () => pipelineStages.reduce((s, p) => s + p.value, 0),
    []
  );
  const maxStage = pipelineStages[0].value;

  return (
    <div
      style={{
        background: T.bg,
        color: T.textPrimary,
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: "100%",
        width: "100%",
        padding: "28px 32px 40px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .sfd-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .sfd-scroll::-webkit-scrollbar-thumb { background: #2A323D; border-radius: 3px; }
        .deal-row:hover { background: #1C2531 !important; }
        button:focus-visible, .focusable:focus-visible {
          outline: 2px solid #4FD1C5;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: T.forecast,
              marginBottom: 6,
            }}
          >
            REVENUE OPS · Q3 REVIEW
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 30,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Sales Forecast
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["6mo", "12mo", "18mo"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: period === p ? T.surfaceRaised : "transparent",
                color: period === p ? T.textPrimary : T.textFaint,
                border: `1px solid ${period === p ? T.border : "transparent"}`,
                borderRadius: 6,
                padding: "7px 14px",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <KpiCard label="Trailing 12mo revenue" value="$5.83M" delta="+18.4%" deltaLabel="vs prior period" positive accent={T.actual} />
        <KpiCard label="Forecast, next 6mo" value="$4.10M" delta="+21.2%" deltaLabel="projected growth" positive accent={T.forecast} />
        <KpiCard label="Open pipeline" value={fmtCurrency(totalPipeline * 1000)} delta="6,890K" deltaLabel="across 296 deals" positive accent={T.textPrimary} />
        <KpiCard label="Win rate, trailing 90d" value="31.2%" delta="-2.1pt" deltaLabel="vs prior 90d" positive={false} />
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Revenue forecast chart */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "20px 20px 8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600 }}>
                Monthly revenue — actual vs. forecast
              </div>
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                Shaded band widens with forecast horizon uncertainty
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.textMuted }}>
                <Circle size={7} fill={T.actual} stroke="none" /> Actual
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.textMuted }}>
                <Circle size={7} fill={T.forecast} stroke="none" /> Forecast
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.forecast} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={T.forecast} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.actual} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={T.actual} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.borderFaint} vertical={false} />
              <XAxis
                dataKey="m"
                tick={{ fill: T.textFaint, fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: T.border }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: T.textFaint, fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}K`}
                width={54}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="high"
                stroke="none"
                fill="url(#bandFill)"
                connectNulls
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="none"
                fill={T.bg}
                fillOpacity={1}
                connectNulls
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={T.actual}
                strokeWidth={2.5}
                fill="url(#actualFill)"
                connectNulls
                dot={false}
                activeDot={{ r: 4, fill: T.actual, stroke: T.bg, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke={T.forecast}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
                activeDot={{ r: 4, fill: T.forecast, stroke: T.bg, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline funnel */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "20px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
            Pipeline by stage
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 18 }}>
            {fmtCurrency(totalPipeline * 1000)} total, 296 open deals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
            {pipelineStages.map((s) => (
              <div key={s.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.textMuted }}>{s.stage}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: T.textPrimary }}>
                    {fmtCurrency(s.value * 1000)}
                  </span>
                </div>
                <div style={{ background: T.bg, borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(s.value / maxStage) * 100}%`,
                      height: "100%",
                      background: s.color,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: T.textFaint, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.count} deals
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: regions + top deals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "20px 20px 8px",
          }}
        >
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
            Bookings by region
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 12 }}>
            Actual vs. target, $K this quarter
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regions} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={6}>
              <CartesianGrid stroke={T.borderFaint} vertical={false} />
              <XAxis dataKey="region" tick={{ fill: T.textFaint, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textFaint, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                cursor={{ fill: T.borderFaint }}
                contentStyle={{ background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, fontFamily: "JetBrains Mono" }}
                labelStyle={{ color: T.textFaint }}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Actual">
                {regions.map((r, i) => (
                  <Cell key={i} fill={r.value >= r.target ? T.actual : T.forecast} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "20px 20px",
          }}
        >
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
            Top open deals
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 14 }}>
            Ranked by value, closing this quarter
          </div>
          <div className="sfd-scroll" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Account", "Stage", "Value", "Probability", "Close date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === "Value" || h === "Probability" ? "right" : "left",
                        padding: "0 10px 10px 0",
                        color: T.textFaint,
                        fontWeight: 500,
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topDeals.map((d) => (
                  <tr key={d.name} className="deal-row" style={{ borderBottom: `1px solid ${T.borderFaint}` }}>
                    <td style={{ padding: "10px 10px 10px 0", color: T.textPrimary }}>{d.name}</td>
                    <td style={{ padding: "10px 10px 10px 0", color: T.textMuted }}>{d.stage}</td>
                    <td style={{ padding: "10px 10px 10px 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: T.textPrimary }}>
                      ${d.value.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 10px 10px 0", textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: d.prob >= 70 ? T.actual : d.prob >= 50 ? T.forecast : T.textMuted,
                        }}
                      >
                        {d.prob}%
                      </span>
                    </td>
                    <td style={{ padding: "10px 0 10px 0", color: T.textFaint, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {d.close}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
