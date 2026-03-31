"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepreciationMethodGrid } from "./depreciation-method-grid";
import { SchedulePreview } from "./schedule-preview";
import {
  getFixedAssetById,
  saveFixedAsset,
  generateAssetId,
} from "@/lib/fixed-assets/fixed-assets-store";
import {
  GL_ACCOUNTS,
  GL_ACCUM_MAP,
  GL_DEPR_EXPENSE_ACCOUNTS,
  GL_DEPR_EXPENSE_DEFAULT_MAP,
  type DepreciationMethod,
  type AssetStatus,
} from "@/types/fixed-assets";

interface FixedAssetFormProps {
  id?: string;
}

export function FixedAssetForm({ id }: FixedAssetFormProps) {
  const router = useRouter();
  const isNew = !id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<AssetStatus>("active");
  const [costStr, setCostStr] = useState("");
  const [residualStr, setResidualStr] = useState("0");
  const [lifeStr, setLifeStr] = useState("");
  const [method, setMethod] = useState<DepreciationMethod>("sl");
  const [glAssetAccount, setGlAssetAccount] = useState("");
  const [glDeprExpenseAccount, setGlDeprExpenseAccount] = useState("");
  const { state, isMobile } = useSidebar();
  const sidebarOffset = isMobile ? "0px" : state === "collapsed" ? "var(--sidebar-width-icon)" : "var(--sidebar-width)";
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const asset = getFixedAssetById(id);
    if (!asset) return;
    setName(asset.name);
    setDescription(asset.description);
    setAcquisitionDate(asset.acquisitionDate);
    setStatus(asset.status);
    setCostStr(String(asset.cost));
    setResidualStr(String(asset.residual));
    setLifeStr(String(asset.life));
    setMethod(asset.method);
    setGlAssetAccount(asset.glAssetAccount);
    setGlDeprExpenseAccount(asset.glDeprExpenseAccount ?? GL_DEPR_EXPENSE_DEFAULT_MAP[asset.glAssetAccount] ?? "");
  }, [id]);

  // Derived: GL accum account from GL asset account
  const glAccumAccount = glAssetAccount ? (GL_ACCUM_MAP[glAssetAccount] ?? "") : "";

  const cost = useMemo(() => {
    const n = parseFloat(costStr);
    return isNaN(n) ? 0 : n;
  }, [costStr]);

  const residual = useMemo(() => {
    const n = parseFloat(residualStr);
    return isNaN(n) ? 0 : n;
  }, [residualStr]);

  const life = useMemo(() => {
    const n = parseInt(lifeStr, 10);
    return isNaN(n) ? 0 : n;
  }, [lifeStr]);

  const showPreview = cost > 0 && life > 0 && residual >= 0 && residual < cost;

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (cost <= 0) errs.cost = "Cost must be greater than 0";
    if (residual < 0) errs.residual = "Residual value cannot be negative";
    if (residual >= cost && cost > 0) errs.residual = "Residual must be less than cost";
    if (life <= 0) errs.life = "Useful life must be at least 1 year";
    if (life > 50) errs.life = "Useful life cannot exceed 50 years";
    if (!glAssetAccount) errs.glAssetAccount = "GL account is required";
    if (!acquisitionDate) errs.acquisitionDate = "Acquisition date is required";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    saveFixedAsset({
      id: id ?? generateAssetId(),
      name: name.trim(),
      description: description.trim(),
      cost,
      residual,
      life,
      method,
      glAssetAccount,
      glAccumAccount,
      glDeprExpenseAccount,
      acquisitionDate,
      status,
      createdAt: isNew ? new Date().toISOString() : (getFixedAssetById(id!)?.createdAt ?? new Date().toISOString()),
    });
    router.push("/fixed-assets");
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-4 max-w-3xl w-full mx-auto pb-24 flex-1">

      <div className="space-y-4">
        {/* Basic Information */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-foreground">Basic Information</p>
            {!isNew && (
              <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                <SelectTrigger
                  id="status"
                  className={cn(
                    "h-auto w-auto rounded-full border px-2.5 py-0.5 text-xs font-medium gap-1 [&>svg]:h-3 [&>svg]:w-3",
                    "focus-visible:ring-1 focus-visible:ring-offset-0",
                    status === "active" && "bg-positive/10 text-positive border-positive/20",
                    status === "done" && "bg-muted text-muted-foreground border-border",
                    status === "disposed" && "bg-muted/50 text-muted-foreground/60 border-border",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="done">Fully Depreciated</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">
                Asset Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. MacBook Pro Fleet (×5)"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acquisitionDate">
                Acquisition Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => {
                    setAcquisitionDate(e.target.value);
                    setErrors((p) => ({ ...p, acquisitionDate: "" }));
                  }}
                  className={`pr-9 date-lucide ${errors.acquisitionDate ? "border-destructive" : ""}`}
                />
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.acquisitionDate && (
                <p className="text-xs text-destructive">{errors.acquisitionDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Location, notes, purchase details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

        </div>

        {/* Financial Details */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-lg font-medium text-foreground">Financial Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cost">
                Cost (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={costStr}
                onChange={(e) => {
                  setCostStr(e.target.value);
                  setErrors((p) => ({ ...p, cost: "" }));
                }}
                className={errors.cost ? "border-destructive" : ""}
              />
              {errors.cost && <p className="text-xs text-destructive">{errors.cost}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="residual">Residual Value (USD)</Label>
              <Input
                id="residual"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={residualStr}
                onChange={(e) => {
                  setResidualStr(e.target.value);
                  setErrors((p) => ({ ...p, residual: "" }));
                }}
                className={errors.residual ? "border-destructive" : ""}
              />
              {errors.residual && <p className="text-xs text-destructive">{errors.residual}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="life">
                Useful Life (years) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="life"
                type="number"
                min="1"
                max="50"
                step="1"
                placeholder="e.g. 5"
                value={lifeStr}
                onChange={(e) => {
                  setLifeStr(e.target.value);
                  setErrors((p) => ({ ...p, life: "" }));
                }}
                className={errors.life ? "border-destructive" : ""}
              />
              {errors.life && <p className="text-xs text-destructive">{errors.life}</p>}
            </div>
          </div>
        </div>

        {/* GL Accounts */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-lg font-medium text-foreground">GL Accounts</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="glAsset">
                GL Asset Account <span className="text-destructive">*</span>
              </Label>
              <Select
                value={glAssetAccount}
                onValueChange={(v) => {
                  setGlAssetAccount(v);
                  setGlDeprExpenseAccount((prev) => prev || (GL_DEPR_EXPENSE_DEFAULT_MAP[v] ?? ""));
                  setErrors((p) => ({ ...p, glAssetAccount: "" }));
                }}
              >
                <SelectTrigger id="glAsset" className={errors.glAssetAccount ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select account…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GL_ACCOUNTS).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {code} — {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.glAssetAccount && (
                <p className="text-xs text-destructive">{errors.glAssetAccount}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="glAccum">GL Accumulated Depreciation</Label>
              <Input
                id="glAccum"
                value={glAccumAccount ? `${glAccumAccount} — Acc. Depreciation` : ""}
                disabled
                placeholder="Auto-derived from GL asset account"
                className="bg-muted/40 text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="glDeprExpense">GL Depreciation Expense</Label>
              <Select value={glDeprExpenseAccount} onValueChange={setGlDeprExpenseAccount}>
                <SelectTrigger id="glDeprExpense">
                  <SelectValue placeholder="Select expense account…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GL_DEPR_EXPENSE_ACCOUNTS).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {code} — {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Depreciation Method */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-lg font-medium text-foreground">Depreciation Method</p>
          <DepreciationMethodGrid value={method} onChange={setMethod} />
        </div>

        {/* Depreciation Schedule Preview */}
        <div id="schedule-preview" className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-lg font-medium text-foreground">Depreciation Schedule Preview</p>
          {showPreview ? (
            <SchedulePreview
              cost={cost}
              residual={residual}
              life={life}
              method={method}
              acquisitionDate={acquisitionDate}
            />
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Fill in cost, residual value, and useful life above to preview the schedule.
            </div>
          )}
        </div>

      </div>
      </div>

      {/* Bottom action bar — fixed to viewport bottom, offset by sidebar width */}
      <div
        className="fixed bottom-0 right-0 z-30 flex items-center justify-between border-t border-border bg-background px-6 py-4"
        style={{ left: sidebarOffset }}
      >
        <Button variant="outline" onClick={() => router.push("/fixed-assets")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving} className="min-w-[130px]">
          {saving ? "Saving…" : isNew ? "Create Asset" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
