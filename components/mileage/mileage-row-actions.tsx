"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Copy, Trash, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface MileageRowActionsProps {
  mileage: MileageItem;
  onDelete: (id: string) => void;
}

export function MileageRowActions({ mileage, onDelete }: MileageRowActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isBilled = mileage.report;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => router.push(`/mileage/${mileage.id}/edit`)}>
            {isBilled ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/mileage/new?sourceId=${mileage.id}`)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          {isBilled ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Mileage
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{mileage.name || "Untitled mileage"}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(mileage.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
