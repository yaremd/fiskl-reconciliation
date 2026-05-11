"use client";

import { useState } from "react";
import {
  CreditCard, Calendar, Repeat,
  XCircle, Trash2, AlertTriangle, ShieldCheck, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CancelPlanModal } from "@/components/settings/cancel-plan-modal";
import { CancelPlanModalV2 } from "@/components/settings/cancel-plan-modal-v2";

const MOCK_SUBSCRIPTION = {
  planId: "Pro",
  billingPeriod: "Monthly" as const,
  amount: 29,
  currency: "GBP",
  autoRenew: true,
  expires: "2026-06-11",
  started: "2025-05-11",
  downgradePlanId: null as string | null,
  failed: false,
};

const MOCK_CARD = {
  brand: "Visa",
  last4: "4242",
  expMonth: 12,
  expYear: 27,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Plan Info Card ────────────────────────────────────────────────────────────

function PlanInfoCard({
  onCancelFlow1,
  onCancelFlow2,
  onDeleteAccount,
}: {
  onCancelFlow1: () => void;
  onCancelFlow2: () => void;
  onDeleteAccount: () => void;
}) {
  const sub = MOCK_SUBSCRIPTION;
  const isExpiring = !sub.autoRenew;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              {sub.planId}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {sub.billingPeriod} billing
            </p>
          </div>
          <Badge className="bg-positive/10 text-positive border-positive/25 font-medium">
            Active
          </Badge>
        </div>

        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-4xl font-bold text-foreground tabular-nums">
            £{sub.amount.toFixed(2)}
          </span>
          <span className="text-muted-foreground text-sm pb-1">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {isExpiring ? "Expires" : "Renews"}
            </p>
            <p className="font-medium text-foreground text-sm">
              {fmtDate(sub.expires)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="font-medium text-foreground text-sm">
              {fmtDate(sub.started)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Button className="w-full">
            <Repeat className="h-4 w-4 mr-2" />
            Change Plan
          </Button>

          <div className="grid grid-cols-2 gap-3">
            {/* Cancel — dropdown to pick flow */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border hover:bg-accent w-full relative">
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Cancel
                  <ChevronDown className="h-3 w-3 opacity-50 absolute right-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onClick={onCancelFlow1}>
                  Flow 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCancelFlow2}>
                  Flow 2
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
              onClick={onDeleteAccount}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Payment Method Card ───────────────────────────────────────────────────────

function PaymentMethodCard() {
  const card = MOCK_CARD;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-7 rounded bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold tracking-wide">
              {card.brand.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {card.brand} •••• {card.last4}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
            </p>
          </div>
          <ShieldCheck className="h-4 w-4 text-positive ml-auto shrink-0" />
        </div>

        <Button variant="outline" className="w-full">
          <CreditCard className="h-4 w-4 mr-2" />
          Update Payment Method
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Card updates are processed securely via Stripe
        </p>
      </CardContent>
    </Card>
  );
}

// ── Delete Account Dialog ─────────────────────────────────────────────────────

function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Permanently
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data — invoices, expenses,
            reconciliations, and settings — will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            If you only want to stop billing, use{" "}
            <strong>Cancel Subscription</strong> instead. That moves you to
            the free plan and keeps your data intact.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="confirm-delete" className="text-sm">
            Type <strong>DELETE</strong> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { onOpenChange(false); setConfirmText(""); }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== "DELETE"}
            onClick={() => { onOpenChange(false); setConfirmText(""); }}
          >
            Delete Account Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [cancelV1Open, setCancelV1Open] = useState(false);
  const [cancelV2Open, setCancelV2Open] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h3 className="text-lg font-semibold">Subscriptions &amp; Billing</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your plan, payment method, and billing details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanInfoCard
          onCancelFlow1={() => setCancelV1Open(true)}
          onCancelFlow2={() => setCancelV2Open(true)}
          onDeleteAccount={() => setDeleteOpen(true)}
        />
        <PaymentMethodCard />
      </div>

      <CancelPlanModal open={cancelV1Open} onOpenChange={setCancelV1Open} />
      <CancelPlanModalV2 open={cancelV2Open} onOpenChange={setCancelV2Open} />
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
