"use client";

import { useState } from "react";
import { AlertCircle, ListChecks, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { MileageItem } from "@/types/mileage";

interface MileageBulkActionsProps {
  selectedItems: MileageItem[];
  onDelete: (ids: string[]) => void;
  onClearSelection: () => void;
}

export function MileageBulkActions({
  selectedItems,
  onDelete,
  onClearSelection,
}: MileageBulkActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedItems.length === 0) return null;

  const deletableItems = selectedItems.filter((i) => !i.report);
  const billedCount = selectedItems.length - deletableItems.length;
  const canDelete = deletableItems.length > 0;

  const label =
    selectedItems.length === 1
      ? "1 mileage selected"
      : `${selectedItems.length} mileages selected`;

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-md border mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {billedCount > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {billedCount} billed (cannot delete)
            </span>
          )}
          <Button
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            onClick={() => setShowConfirm(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete{canDelete && billedCount > 0 ? ` (${deletableItems.length})` : ""}
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletableItems.length === 1
                ? "1 mileage entry will be permanently deleted."
                : `${deletableItems.length} mileage entries will be permanently deleted.`}
              {billedCount > 0 && (
                <span className="block mt-2">
                  {billedCount} billed {billedCount === 1 ? "entry" : "entries"} will be skipped.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(deletableItems.map((i) => i.id));
                setShowConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
