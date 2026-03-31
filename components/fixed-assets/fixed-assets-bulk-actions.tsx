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
import type { FixedAsset } from "@/types/fixed-assets";

interface AssetBulkActionsProps {
  selectedItems: FixedAsset[];
  onDelete: (ids: string[]) => void;
  onClearSelection: () => void;
}

export function AssetBulkActions({
  selectedItems,
  onDelete,
  onClearSelection,
}: AssetBulkActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedItems.length === 0) return null;

  // Active assets have accounting implications — warn but allow delete for this v1 prototype
  const activeCount = selectedItems.filter((i) => i.status === "active").length;

  const label =
    selectedItems.length === 1
      ? "1 asset selected"
      : `${selectedItems.length} assets selected`;

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
          {activeCount > 0 && (
            <span className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {activeCount} active asset{activeCount !== 1 ? "s" : ""}
            </span>
          )}
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete ({selectedItems.length})
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItems.length === 1
                ? "1 fixed asset will be permanently deleted."
                : `${selectedItems.length} fixed assets will be permanently deleted.`}
              {activeCount > 0 && (
                <span className="block mt-2 text-warning">
                  {activeCount} active asset{activeCount !== 1 ? "s" : ""} with depreciation
                  history will also be removed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(selectedItems.map((i) => i.id));
                setShowConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
