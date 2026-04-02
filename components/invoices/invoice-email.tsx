"use client";

import { useState } from "react";
import { Mail, Bell, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const OVERDUE_OPTIONS = [1, 3, 7, 14];

interface InvoiceEmailProps {
  emailSubject: string;
  emailMessage: string;
  overdueReminders: number[];
  clientEmail: string;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onRemindersChange: (v: number[]) => void;
}

export function InvoiceEmail({
  emailSubject,
  emailMessage,
  overdueReminders,
  clientEmail,
  onSubjectChange,
  onMessageChange,
  onRemindersChange,
}: InvoiceEmailProps) {
  const [sent, setSent] = useState(false);

  function toggleReminder(days: number) {
    if (overdueReminders.includes(days)) {
      onRemindersChange(overdueReminders.filter((d) => d !== days));
    } else {
      onRemindersChange([...overdueReminders, days].sort((a, b) => a - b));
    }
  }

  function handleSend() {
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Send To */}
      <div className="space-y-1">
        <Label className="text-[11px]">Send To</Label>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{clientEmail || "No client email set"}</span>
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1">
        <Label className="text-[11px]">Subject</Label>
        <Input
          value={emailSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="h-7 text-xs"
          placeholder="Invoice subject line"
        />
      </div>

      {/* Message */}
      <div className="space-y-1">
        <Label className="text-[11px]">Message</Label>
        <Textarea
          value={emailMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="text-xs min-h-[72px] resize-none"
          placeholder="Email body…"
        />
      </div>

      {/* Overdue reminders */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-[11px]">Overdue reminders</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {OVERDUE_OPTIONS.map((days) => {
            const active = overdueReminders.includes(days);
            return (
              <button
                key={days}
                type="button"
                onClick={() => toggleReminder(days)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                )}
              >
                {active && <Check className="h-2.5 w-2.5" />}
                {days}d
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Send automatic reminders 1, 3, 7, or 14 days after due date.
        </p>
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!clientEmail || sent}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
          sent
            ? "bg-green-50 text-green-700 border-green-200"
            : clientEmail
            ? "bg-primary text-white border-primary hover:bg-primary/90"
            : "bg-muted text-muted-foreground border-border cursor-not-allowed"
        )}
      >
        {sent ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Email Sent (simulated)
          </>
        ) : (
          <>
            <Mail className="h-3.5 w-3.5" />
            Send Invoice
          </>
        )}
      </button>
    </div>
  );
}
