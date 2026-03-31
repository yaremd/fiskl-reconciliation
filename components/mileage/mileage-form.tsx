"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  getMileageById,
  saveMileage,
  generateId,
  calculateSubtotal,
} from "@/lib/mileage/mileage-store";
import { MOCK_CLIENTS } from "@/lib/mileage/mock-data";
import type { MileageItem, DistanceUnit, MileageEntryMode } from "@/types/mileage";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"];
const IRS_RATE: Record<DistanceUnit, number> = { mi: 0.67, km: 0.42 };

interface MileageFormProps {
  id?: string;
  sourceId?: string;
}

export function MileageForm({ id, sourceId }: MileageFormProps) {
  const router = useRouter();
  const isNew = !id;

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [occurDate, setOccurDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [clientId, setClientId] = useState("none");
  const [currency, setCurrency] = useState("USD");
  const [unit, setUnit] = useState<DistanceUnit>("mi");
  const [entryMode, setEntryMode] = useState<MileageEntryMode>("manual");
  const [quantityStr, setQuantityStr] = useState("");
  const [startMileageStr, setStartMileageStr] = useState("");
  const [finishMileageStr, setFinishMileageStr] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [priceStr, setPriceStr] = useState("0.67");
  const [reimbursable, setReimbursable] = useState(false);
  const [isBilled, setIsBilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalAnimKey, setTotalAnimKey] = useState(0);

  useEffect(() => {
    const loadId = id || sourceId;
    if (!loadId) return;
    const m = getMileageById(loadId);
    if (!m) return;
    setName(sourceId ? `Copy of ${m.name}` : m.name);
    setNote(m.note);
    setOccurDate(m.occurDate);
    setClientId(m.client?.id ?? "none");
    setCurrency(m.currency);
    setUnit(m.unit);
    setEntryMode(m.entryMode);
    setRoundTrip(m.roundTrip);
    setPriceStr(String(m.price));
    setReimbursable(m.reimbursable);
    setIsBilled(sourceId ? false : m.report);
    if (m.entryMode === "odometer") {
      setStartMileageStr(m.startMileage != null ? String(m.startMileage) : "");
      setFinishMileageStr(m.finishMileage != null ? String(m.finishMileage) : "");
    } else {
      setQuantityStr(m.quantity != null ? String(m.quantity) : "");
    }
  }, [id, sourceId]);

  useEffect(() => {
    const p = parseFloat(priceStr);
    if (p === IRS_RATE["mi"] || p === IRS_RATE["km"]) setPriceStr(String(IRS_RATE[unit]));
  }, [unit]); // eslint-disable-line

  const odometerDistance = useMemo(() => {
    const s = parseFloat(startMileageStr), f = parseFloat(finishMileageStr);
    return isNaN(s) || isNaN(f) ? null : Math.max(0, f - s);
  }, [startMileageStr, finishMileageStr]);

  const effectiveQuantity = useMemo(() => {
    if (entryMode === "odometer") return odometerDistance;
    const q = parseFloat(quantityStr);
    return isNaN(q) ? null : q;
  }, [entryMode, odometerDistance, quantityStr]);

  const subtotal = useMemo(() => {
    setTotalAnimKey(k => k + 1);
    return calculateSubtotal(effectiveQuantity, parseFloat(priceStr) || 0, roundTrip);
  }, [effectiveQuantity, priceStr, roundTrip]);

  const handleEntryModeChange = (mode: MileageEntryMode) => {
    setEntryMode(mode);
    if (mode === "manual") { setStartMileageStr(""); setFinishMileageStr(""); }
    else setQuantityStr("");
  };

  const handleRoundTripChange = (checked: boolean) => {
    if (entryMode === "manual" && quantityStr) {
      const q = parseFloat(quantityStr);
      if (!isNaN(q)) {
        const base = roundTrip ? q / 2 : q;
        setQuantityStr(String(checked ? base * 2 : base));
      }
    }
    setRoundTrip(checked);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Required";
    if (!occurDate) errs.occurDate = "Required";
    if (!priceStr || parseFloat(priceStr) <= 0) errs.price = "Must be > 0";
    if (entryMode === "odometer") {
      if (!startMileageStr) errs.startMileage = "Required";
      if (!finishMileageStr) errs.finishMileage = "Required";
      if (odometerDistance !== null && odometerDistance < 0) errs.finishMileage = "Must exceed start";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const client = MOCK_CLIENTS.find(c => c.id === clientId) ?? null;
    const item: MileageItem = {
      id: id && !sourceId ? id : generateId(),
      name: name.trim(), note: note.trim(), occurDate, client,
      quantity: effectiveQuantity, unit,
      startMileage: entryMode === "odometer" ? parseFloat(startMileageStr) || null : null,
      finishMileage: entryMode === "odometer" ? parseFloat(finishMileageStr) || null : null,
      roundTrip, price: parseFloat(priceStr) || 0, subtotal, currency,
      reimbursable, report: isBilled, entryMode, createdAt: new Date().toISOString(),
    };
    await new Promise(r => setTimeout(r, 200));
    saveMileage(item);
    setSaving(false);
    router.push("/mileage");
  };

  const displayTotal = useMemo(() => {
    try { return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(subtotal); }
    catch { return `${currency} ${subtotal.toFixed(2)}`; }
  }, [subtotal, currency]);

  const displayDate = useMemo(() => {
    if (!occurDate) return "—";
    try { return new Date(occurDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return occurDate; }
  }, [occurDate]);

  const clientName = MOCK_CLIENTS.find(c => c.id === clientId)?.companyName ?? null;
  const hasDistance = effectiveQuantity != null && effectiveQuantity > 0;

  return (
    <>
      <style>{`
        /* Trip computer panel */
        .mf-panel {
          background: #07101F;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 32px 80px rgba(0,0,0,0.35),
            0 0 0 1px rgba(255,255,255,0.06),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .mf-panel-bar {
          height: 3px;
          background: linear-gradient(90deg, #0058FF 0%, #00B4FF 50%, #00E0A0 100%);
        }

        /* Animated total */
        .mf-total-pop {
          animation: mf-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes mf-pop {
          0%   { transform: scale(0.9) translateY(4px); opacity: 0.5; }
          100% { transform: scale(1)   translateY(0);   opacity: 1; }
        }

        /* Route SVG dot animation */
        @keyframes mf-travel {
          0%   { offset-distance: 0%;   opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }

        /* Inputs */
        .mf-input {
          height: 42px;
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          padding: 0 13px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
          background: var(--card);
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }
        .mf-input::placeholder { color: var(--input); font-weight: 400; }
        .mf-input:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3.5px color-mix(in oklch, var(--ring) 15%, transparent);
        }
        .mf-input.err { border-color: var(--destructive); box-shadow: 0 0 0 3px color-mix(in oklch, var(--destructive) 10%, transparent); }
        .mf-input:disabled { background: var(--muted); color: var(--muted-foreground); cursor: not-allowed; }
        .mf-input[type="number"] { font-family: ui-monospace, monospace; }

        .mf-textarea {
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          padding: 11px 13px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
          background: var(--card);
          resize: none;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          min-height: 68px;
        }
        .mf-textarea::placeholder { color: var(--input); font-weight: 400; }
        .mf-textarea:focus { border-color: var(--ring); box-shadow: 0 0 0 3.5px color-mix(in oklch, var(--ring) 15%, transparent); }

        .mf-select {
          height: 42px;
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          padding: 0 36px 0 13px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
          background: var(--card) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 11px center;
          appearance: none;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .mf-select:focus { border-color: var(--ring); box-shadow: 0 0 0 3.5px color-mix(in oklch, var(--ring) 15%, transparent); }
        .mf-select:disabled { background-color: var(--muted); color: var(--muted-foreground); cursor: not-allowed; }

        /* Section card */
        .mf-card {
          background: var(--card);
          border-radius: 16px;
          border: 1.5px solid var(--border);
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        /* Mode toggle */
        .mf-mode-wrap {
          display: inline-flex;
          background: var(--accent);
          border-radius: 10px;
          padding: 4px;
          gap: 2px;
          margin-bottom: 20px;
        }
        .mf-mode-btn {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.01em;
          padding: 7px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          color: var(--muted-foreground);
          background: transparent;
        }
        .mf-mode-btn.active {
          background: var(--card);
          color: var(--foreground);
          box-shadow: 0 1px 6px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
        }
        .mf-mode-btn:hover:not(.active):not(:disabled) { color: var(--foreground); }

        /* Stat chip on panel */
        .mf-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 12px 14px;
        }

        /* Nav bar */
        .mf-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: color-mix(in oklch, var(--background) 88%, transparent);
          backdrop-filter: blur(12px);
          border-bottom: 1.5px solid var(--border);
        }

        /* Section label */
        .mf-slabel {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          margin-bottom: 16px;
        }

        /* Field label */
        .mf-flabel {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted-foreground);
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }

        .mf-mono { font-family: ui-monospace, monospace; }
        .mf-err-text { font-size: 11px; color: var(--destructive); margin-top: 5px; font-weight: 600; }

        /* Divider row */
        .mf-divrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1.5px solid var(--border);
          margin-top: 8px;
        }

        /* Save button */
        .mf-save {
          background: linear-gradient(135deg, #0058FF 0%, #00B4FF 100%);
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.01em;
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .mf-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,88,255,0.3);
        }
        .mf-save:active:not(:disabled) { transform: translateY(0); }
        .mf-save:disabled { opacity: 0.55; cursor: not-allowed; }

        .mf-cancel {
          font-size: 14px;
          font-weight: 700;
          color: var(--muted-foreground);
          background: transparent;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 10px 18px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mf-cancel:hover { border-color: var(--input); color: var(--foreground); background: var(--muted); }

        /* Entry appear */
        .mf-appear {
          animation: mf-appear 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes mf-appear {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Glow on distance fields when set */
        .mf-input-set {
          border-color: rgba(0,88,255,0.3) !important;
          background: rgba(0,88,255,0.02) !important;
        }

        /* Calculated field */
        .mf-calc-field {
          height: 42px;
          display: flex;
          align-items: center;
          padding: 0 13px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--muted);
          font-family: ui-monospace, monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--foreground);
        }
        .mf-calc-field.has-val {
          border-color: rgba(0,224,160,0.35);
          background: rgba(0,224,160,0.04);
          color: #0a5544;
        }

        /* Total display */
        .mf-total-display {
          height: 42px;
          display: flex;
          align-items: center;
          padding: 0 13px;
          border-radius: 10px;
          font-family: ui-monospace, monospace;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          transition: all 0.2s;
        }
        .mf-total-display.zero {
          background: var(--muted);
          border: 1.5px solid var(--border);
          color: var(--muted-foreground);
        }
        .mf-total-display.has-val {
          background: color-mix(in oklch, var(--primary) 6%, transparent);
          border: 1.5px solid color-mix(in oklch, var(--primary) 25%, transparent);
          color: var(--primary);
        }
      `}</style>

      <div className="mf-root" style={{ minHeight: "100vh", background: "var(--muted)" }}>

        {/* ── Sticky top bar ── */}
        <div className="mf-topbar">
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => router.push("/mileage")}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8, transition: "color 0.15s, background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <ArrowLeft size={15} />
              Mileage
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="mf-cancel" onClick={() => router.push("/mileage")} disabled={saving}>Cancel</button>
              {!isBilled && (
                <button className="mf-save" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                    : <><Save size={15} />Save Entry</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px", display: "flex", gap: 32, alignItems: "flex-start" }}>

          {/* ═══ LEFT: Trip Computer ═══ */}
          <div style={{ width: 288, flexShrink: 0, position: "sticky", top: 76 }} className="hidden lg:block">
            <div className="mf-panel">
              <div className="mf-panel-bar" />
              <div style={{ padding: "24px 22px 26px" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Trip Computer</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E0A0", display: "inline-block", boxShadow: "0 0 6px #00E0A0", animation: "mf-pulse 2s infinite" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}>LIVE</span>
                  </div>
                </div>

                {/* Big total */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>Billable Total</div>
                  <div
                    key={`total-${totalAnimKey}`}
                    className="mf-total-pop mf-mono"
                    style={{
                      fontSize: 38,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      ...(subtotal > 0
                        ? { background: "linear-gradient(90deg,#0058FF,#00B4FF 50%,#00E0A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
                        : { color: "rgba(255,255,255,0.18)" }
                      )
                    }}
                  >
                    {displayTotal}
                  </div>
                </div>

                {/* Animated route SVG */}
                <div style={{ position: "relative", height: 28, marginBottom: 18 }}>
                  <svg viewBox="0 0 244 28" fill="none" style={{ width: "100%", height: 28 }}>
                    {/* Dashed track */}
                    <line x1="12" y1="14" x2="232" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
                    {/* Gradient track */}
                    <line x1="12" y1="14" x2="232" y2="14" stroke="url(#mf-grad)" strokeWidth="1.5" strokeOpacity="0.35" />
                    {/* Traveling dot path (hidden, used for motion) */}
                    <path id="mf-travel-path" d="M12,14 L232,14" stroke="none" fill="none" />
                    {/* Origin dot */}
                    <circle cx="12" cy="14" r="5" fill="#0058FF" />
                    <circle cx="12" cy="14" r="3" fill="#1a6fff" />
                    {/* Destination dot */}
                    <circle cx="232" cy="14" r="5" fill="#00E0A0" />
                    <circle cx="232" cy="14" r="3" fill="#2effc0" />
                    {/* Traveling glow dot */}
                    {hasDistance && (
                      <circle r="3.5" fill="white" style={{ offsetPath: "path('M12,14 L232,14')", offsetDistance: "0%", animation: "mf-travel 2.4s ease-in-out infinite" } as React.CSSProperties} />
                    )}
                    <defs>
                      <linearGradient id="mf-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0058FF" />
                        <stop offset="50%" stopColor="#00B4FF" />
                        <stop offset="100%" stopColor="#00E0A0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <div className="mf-stat">
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Distance</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="mf-mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: hasDistance ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.2)" }}>
                        {effectiveQuantity != null ? effectiveQuantity.toFixed(1) : "—"}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.38)" }}>{unit}</span>
                      {roundTrip && (
                        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 100, background: "rgba(0,224,160,0.12)", color: "#00E0A0" }}>RT</span>
                      )}
                    </div>
                  </div>
                  <div className="mf-stat">
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Rate</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="mf-mono" style={{ fontSize: 18, fontWeight: 600, color: parseFloat(priceStr) > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)" }}>
                        {parseFloat(priceStr) > 0 ? parseFloat(priceStr).toFixed(2) : "—"}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>/ {unit}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 16px" }} />

                {/* Meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {clientName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 2, background: "#00B4FF", opacity: 0.7, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{clientName}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 2, background: "#00E0A0", opacity: 0.6, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{displayDate}</span>
                  </div>
                  {reimbursable && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 2, background: "#0058FF", opacity: 0.8, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Reimbursable</span>
                    </div>
                  )}
                  {entryMode === "odometer" && startMileageStr && finishMileageStr && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 2, background: "#00E0A0", opacity: 0.5, flexShrink: 0 }} />
                      <span className="mf-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{startMileageStr} → {finishMileageStr}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: Form ═══ */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Page title */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
                {isNew ? "New Mileage Entry" : "Edit Mileage Entry"}
              </h1>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6, fontWeight: 500 }}>
                {isNew ? "Log a business trip to track and bill mileage." : "Update the details for this trip."}
              </p>
            </div>

            {/* Billed banner */}
            {isBilled && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,224,160,0.07)", border: "1.5px solid rgba(0,224,160,0.28)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E0A0", flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f5132", margin: 0 }}>This entry is billed and cannot be edited.</p>
              </div>
            )}

            {/* ── Section 1: Trip Details ── */}
            <div className="mf-card mf-appear" style={{ marginBottom: 14 }}>
              <div className="mf-slabel">Trip Details</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="mf-flabel">Description <span style={{ color: "#f43f5e" }}>*</span></label>
                  <input className={`mf-input${errors.name ? " err" : ""}`} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Client site visit" disabled={isBilled} />
                  {errors.name && <div className="mf-err-text">{errors.name}</div>}
                </div>
                <div>
                  <label className="mf-flabel">Date <span style={{ color: "#f43f5e" }}>*</span></label>
                  <input type="date" className={`mf-input${errors.occurDate ? " err" : ""}`} value={occurDate} onChange={e => setOccurDate(e.target.value)} disabled={isBilled} />
                  {errors.occurDate && <div className="mf-err-text">{errors.occurDate}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="mf-flabel">Client</label>
                  <select className="mf-select" value={clientId} onChange={e => setClientId(e.target.value)} disabled={isBilled}>
                    <option value="none">No client</option>
                    {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mf-flabel">Currency</label>
                  <select className="mf-select" value={currency} onChange={e => setCurrency(e.target.value)} disabled={isBilled}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mf-flabel">Notes</label>
                <textarea className="mf-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional notes about this trip" disabled={isBilled} rows={2} />
              </div>
            </div>

            {/* ── Section 2: Distance ── */}
            <div className="mf-card mf-appear" style={{ marginBottom: 14, animationDelay: "0.06s" }}>
              <div className="mf-slabel">Distance</div>

              {/* Mode switcher */}
              <div className="mf-mode-wrap">
                <button className={`mf-mode-btn${entryMode === "manual" ? " active" : ""}`} onClick={() => !isBilled && handleEntryModeChange("manual")} disabled={isBilled}>
                  Manual
                </button>
                <button className={`mf-mode-btn${entryMode === "odometer" ? " active" : ""}`} onClick={() => !isBilled && handleEntryModeChange("odometer")} disabled={isBilled}>
                  Odometer
                </button>
              </div>

              {entryMode === "manual" ? (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                  <div>
                    <label className="mf-flabel">Distance</label>
                    <input
                      type="number" min="0" step="0.1"
                      className={`mf-input${quantityStr && parseFloat(quantityStr) > 0 ? " mf-input-set" : ""}`}
                      value={quantityStr} onChange={e => setQuantityStr(e.target.value)}
                      placeholder="0.0" disabled={isBilled}
                    />
                  </div>
                  <div>
                    <label className="mf-flabel">Unit</label>
                    <select className="mf-select" value={unit} onChange={e => setUnit(e.target.value as DistanceUnit)} disabled={isBilled}>
                      <option value="mi">mi</option>
                      <option value="km">km</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="mf-flabel">Start ({unit})</label>
                    <input type="number" min="0" step="0.1" className={`mf-input${errors.startMileage ? " err" : ""}`} value={startMileageStr} onChange={e => setStartMileageStr(e.target.value)} placeholder="0.0" disabled={isBilled} />
                    {errors.startMileage && <div className="mf-err-text">{errors.startMileage}</div>}
                  </div>
                  <div>
                    <label className="mf-flabel">Finish ({unit})</label>
                    <input type="number" min="0" step="0.1" className={`mf-input${errors.finishMileage ? " err" : ""}`} value={finishMileageStr} onChange={e => setFinishMileageStr(e.target.value)} placeholder="0.0" disabled={isBilled} />
                    {errors.finishMileage && <div className="mf-err-text">{errors.finishMileage}</div>}
                  </div>
                  <div>
                    <label className="mf-flabel">Calculated</label>
                    <div className={`mf-calc-field${odometerDistance != null && odometerDistance > 0 ? " has-val" : ""}`}>
                      {odometerDistance != null ? `${odometerDistance.toFixed(1)} ${unit}` : "—"}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <label className="mf-flabel">Unit</label>
                      <select className="mf-select" value={unit} onChange={e => setUnit(e.target.value as DistanceUnit)} disabled={isBilled}>
                        <option value="mi">mi</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Round trip */}
              <div className="mf-divrow">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Round trip</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, fontWeight: 500 }}>Return journey — doubles the distance</div>
                </div>
                <Switch checked={roundTrip} onCheckedChange={handleRoundTripChange} disabled={isBilled} />
              </div>
            </div>

            {/* ── Section 3: Rate & Billing ── */}
            <div className="mf-card mf-appear" style={{ animationDelay: "0.12s" }}>
              <div className="mf-slabel">Rate & Billing</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
                <div>
                  <label className="mf-flabel">Rate per {unit} ({currency}) <span style={{ color: "#f43f5e" }}>*</span></label>
                  <input type="number" min="0" step="0.01" className={`mf-input${errors.price ? " err" : ""}`} value={priceStr} onChange={e => setPriceStr(e.target.value)} placeholder="0.67" disabled={isBilled} />
                  {errors.price && <div className="mf-err-text">{errors.price}</div>}
                </div>
                <div>
                  <label className="mf-flabel">Total</label>
                  <div key={`total-field-${totalAnimKey}`} className={`mf-total-display mf-total-pop${subtotal > 0 ? " has-val" : " zero"}`}>
                    {displayTotal}
                  </div>
                  {effectiveQuantity != null && (
                    <div className="mf-mono" style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 5, fontWeight: 500 }}>
                      {effectiveQuantity.toFixed(1)}{roundTrip ? " × 2 (RT)" : ""} × {parseFloat(priceStr).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Reimbursable */}
              <div className="mf-divrow">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Reimbursable</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, fontWeight: 500 }}>Client will reimburse this trip</div>
                </div>
                <Switch checked={reimbursable} onCheckedChange={setReimbursable} disabled={isBilled} />
              </div>
            </div>

            {/* Mobile actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }} className="lg:hidden">
              <button className="mf-cancel" onClick={() => router.push("/mileage")}>Cancel</button>
              {!isBilled && (
                <button className="mf-save" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 size={15} className="animate-spin" />Saving…</> : <><Save size={15} />Save Entry</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
