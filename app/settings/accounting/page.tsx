"use client";

import { useState } from "react";
import { Loader2, HelpCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";

const TAX_TYPES = ["No Tax", "Simple Tax (GST/VAT)", "Complex Tax (multi-rate)"];

const INCOME_ACCOUNTS = [
  "Sales - General",
  "Sales - Products",
  "Sales of Services",
  "Sales - Other",
  "Dividend Income",
  "Interest Income",
  "Sales - Billed Expenses",
  "Other Income",
];

interface AccountingSettings {
  taxType: string;
  fiscalYearEnd: string;
  accrual: boolean;
  autoMatching: boolean;
  autoCategorization: boolean;
  defaultProductAccount: string;
  defaultServiceAccount: string;
  defaultTimeAccount: string;
  defaultMileageAccount: string;
  defaultExpenseAccount: string;
  lockDate: string;
  lockAll: boolean;
}

const DEFAULT_SETTINGS: AccountingSettings = {
  taxType: "No Tax",
  fiscalYearEnd: "2026-12-31",
  accrual: true,
  autoMatching: false,
  autoCategorization: false,
  defaultProductAccount: "Dividend Income",
  defaultServiceAccount: "Sales of Services",
  defaultTimeAccount: "Sales - Other",
  defaultMileageAccount: "Sales - Other",
  defaultExpenseAccount: "Sales - Billed Expenses",
  lockDate: "",
  lockAll: false,
};

export default function AccountingSettingsPage() {
  const [settings, setSettings] = useState<AccountingSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof AccountingSettings>(key: K, value: AccountingSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h3 className="text-lg font-semibold">Accounting Settings</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your company's accounting preferences and default accounts
        </p>
      </div>

      {/* ── Card 1: Core accounting settings ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h2 className="text-base font-semibold">Accounting Settings</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Company Currency — locked */}
            <div className="space-y-2">
              <Label>Company Currency</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-9 rounded-md border border-input bg-background px-3 flex items-center text-sm text-muted-foreground">
                  GBP
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted rounded px-2 py-1 shrink-0">
                  Locked
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                The primary currency cannot be changed after company creation
              </p>
            </div>

            {/* Tax Type */}
            <div className="space-y-2">
              <Label>Company Tax Type</Label>
              <Select value={settings.taxType} onValueChange={(v) => update("taxType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Tax structure used by your business</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Fiscal Year End */}
            <div className="space-y-2">
              <Label>Fiscal Year End</Label>
              <DatePicker
                value={settings.fiscalYearEnd}
                onChange={(v) => update("fiscalYearEnd", v)}
                placeholder="Select date"
                className="w-48"
              />
              <p className="text-xs text-muted-foreground">The last day of your company's financial year</p>
            </div>

            {/* Accounting Method toggle */}
            <div className="space-y-2">
              <Label>Accounting Method</Label>
              <div className="flex items-center gap-3 h-9">
                <span className={`text-sm ${!settings.accrual ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  Cash Based
                </span>
                <Switch
                  checked={settings.accrual}
                  onCheckedChange={(v) => update("accrual", v)}
                />
                <span className={`text-sm ${settings.accrual ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  Accrual Based
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose between cash-based or accrual-based accounting
              </p>
            </div>
          </div>

          <Separator />

          {/* Auto toggles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Auto Matching</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Match bank transactions with invoices and expenses
                </p>
              </div>
              <Switch
                checked={settings.autoMatching}
                onCheckedChange={(v) => update("autoMatching", v)}
              />
            </div>
            <div className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Auto Categorization</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Categorize transactions based on learned patterns
                </p>
              </div>
              <Switch
                checked={settings.autoCategorization}
                onCheckedChange={(v) => update("autoCategorization", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Default Income Accounts ── */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Default Income Accounts</h2>
            <Button variant="outline" size="sm">Refresh Accounts</Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <AccountSelect
              label="For Products"
              description="Default income account for product sales"
              value={settings.defaultProductAccount}
              onChange={(v) => update("defaultProductAccount", v)}
            />
            <AccountSelect
              label="For Services and the Rest"
              description="Default income account for service sales"
              value={settings.defaultServiceAccount}
              onChange={(v) => update("defaultServiceAccount", v)}
            />
            <AccountSelect
              label="For Time"
              description="Default income account for time tracking"
              value={settings.defaultTimeAccount}
              onChange={(v) => update("defaultTimeAccount", v)}
            />
            <AccountSelect
              label="For Mileage"
              description="Default income account for mileage tracking"
              value={settings.defaultMileageAccount}
              onChange={(v) => update("defaultMileageAccount", v)}
            />
            <AccountSelect
              label="For Billable Expenses"
              description="Default income account for billable expenses"
              value={settings.defaultExpenseAccount}
              onChange={(v) => update("defaultExpenseAccount", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Lock Period ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Lock Period</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-64">
                  Prevents changes to any transaction on or before this date.
                  Advisors can still edit unless "Lock for all" is checked.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Stop changes to historical data from a specific date. You can update this at any time.
          </p>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Locked until</Label>
              <DatePicker
                value={settings.lockDate}
                onChange={(v) => { update("lockDate", v); if (!v) update("lockAll", false); }}
                placeholder="No lock date set"
                className="w-48"
                clearable
              />
            </div>

            <label className={`flex items-start gap-3 cursor-pointer group ${!settings.lockDate ? "opacity-40 pointer-events-none" : ""}`}>
              <Checkbox
                checked={settings.lockAll}
                onCheckedChange={(v) => update("lockAll", !!v)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium leading-none">Lock for all users</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {settings.lockAll
                    ? "No one can edit transactions on or before this date — including advisors."
                    : "By default, advisors can still make changes. Check this to block everyone."}
                </p>
              </div>
            </label>
          </div>

          {settings.lockDate && (
            <div className={`rounded-md border px-4 py-3 flex items-center gap-3 text-sm ${
              settings.lockAll
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : "border-amber-300/60 bg-amber-50 text-amber-800"
            }`}>
              <Lock className="h-4 w-4 shrink-0" />
              <p>
                {settings.lockAll
                  ? `Hard locked until ${new Date(settings.lockDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. No one can make changes before this date.`
                  : `Locked until ${new Date(settings.lockDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. Advisors can still edit.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

    </div>
  );
}

function AccountSelect({
  label, description, value, onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INCOME_ACCOUNTS.map((a) => (
            <SelectItem key={a} value={a}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
