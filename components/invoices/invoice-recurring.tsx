"use client";

import { Play, Pause, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RECURRING_PERIODS } from "@/types/invoices";
import type { InvoiceSchedule, RecurringPeriod } from "@/types/invoices";

interface InvoiceRecurringProps {
  schedule: InvoiceSchedule | null;
  onChange: (schedule: InvoiceSchedule | null) => void;
}

const DEFAULT_SCHEDULE: InvoiceSchedule = {
  every: 1,
  period: "Monthly",
  remaining: 12,
  endDate: null,
  autoSend: false,
  status: "Scheduled",
};

export function InvoiceRecurring({ schedule, onChange }: InvoiceRecurringProps) {
  const enabled = schedule !== null;

  function toggle() {
    if (enabled) {
      onChange(null);
    } else {
      onChange({ ...DEFAULT_SCHEDULE });
    }
  }

  function update(patch: Partial<InvoiceSchedule>) {
    if (!schedule) return;
    onChange({ ...schedule, ...patch });
  }

  function toggleStatus() {
    if (!schedule) return;
    update({ status: schedule.status === "Scheduled" ? "Paused" : "Scheduled" });
  }

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-medium">Recurring Invoice</p>
          <p className="text-[11px] text-muted-foreground">Auto-generate invoices on a schedule</p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} />
      </div>

      {enabled && schedule && (
        <div className="space-y-3">
          {/* Frequency */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Every</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={schedule.every}
                onChange={(e) => update({ every: parseInt(e.target.value) || 1 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Period</Label>
              <Select value={schedule.period} onValueChange={(v) => update({ period: v as RecurringPeriod })}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Remaining + End Date */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Invoices remaining</Label>
              <Input
                type="number"
                min={1}
                value={schedule.remaining}
                onChange={(e) => update({ remaining: parseInt(e.target.value) || 1 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">End date (optional)</Label>
              <Input
                type="date"
                value={schedule.endDate ?? ""}
                onChange={(e) => update({ endDate: e.target.value || null })}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* Auto-send */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-xs font-medium">Auto-send emails</p>
              <p className="text-[10px] text-muted-foreground">Automatically email each generated invoice</p>
            </div>
            <Switch
              checked={schedule.autoSend}
              onCheckedChange={(v) => update({ autoSend: v })}
            />
          </div>

          {/* Status badge + toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <RefreshCw className={cn(
                "h-3.5 w-3.5",
                schedule.status === "Scheduled" ? "text-primary" : "text-muted-foreground"
              )} />
              <div>
                <span className={cn(
                  "text-xs font-semibold",
                  schedule.status === "Scheduled" ? "text-primary" : "text-muted-foreground"
                )}>
                  {schedule.status}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Every {schedule.every} {schedule.period.toLowerCase()}{schedule.every > 1 ? "s" : ""}
                  {schedule.remaining > 0 ? ` · ${schedule.remaining} remaining` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleStatus}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
            >
              {schedule.status === "Scheduled" ? (
                <><Pause className="h-3 w-3" /> Pause</>
              ) : (
                <><Play  className="h-3 w-3" /> Resume</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
