import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGroup } from '@/contexts/GroupContext';
import { Trash2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/firebaseClient';
import { doc, deleteDoc, writeBatch } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';

const DeleteExpenseDialog = ({ open, onOpenChange, expense, onDeleteSuccess }) => {
  const { currentGroupId, settlements, members, fetchGroupData } = useGroup();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cleanDelete, setCleanDelete] = useState(true);

  // Find settlements that might be related to this expense
  // We look for any settlement from a participant to the payer that matches their share
  const relatedSettlements = useMemo(() => {
    if (!expense || !settlements.length) return [];

    const amount = parseFloat(expense.amount);
    const shares = (expense.participants || []).map(p => ({
      memberId: p.memberId,
      amount: Math.round(amount * (parseFloat(p.percentage) / 100) * 100) / 100
    }));

    return settlements.filter(s => {
      // Must be a completed payment to the original payer
      if (s.status !== 'completed' || s.toMemberId !== expense.payerId) return false;
      
      const share = shares.find(sh => sh.memberId === s.fromMemberId);
      if (!share) return false;

      // Check if amount matches or if it's within a small margin (rounding)
      const amountDiff = Math.abs(parseFloat(s.amount) - share.amount);
      return amountDiff < 0.1; // Broadened from 0.05
    });
  }, [expense, settlements]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. Delete associated settlements if 'Clean Delete' is selected
      if (cleanDelete && relatedSettlements.length > 0) {
        for (const s of relatedSettlements) {
          batch.delete(doc(db, "settlements", s.id));
        }
      }

      // 2. Delete the expense
      batch.delete(doc(db, "expenses", expense.id));

      await batch.commit();

      toast({ 
        title: 'Success', 
        description: cleanDelete && relatedSettlements.length > 0 
          ? `Cleaned up! Removed expense and ${relatedSettlements.length} matching payment(s). Balance remains 0.` 
          : 'Expense deleted successfully. Participant balances have shifted.' 
      });

      await fetchGroupData();
      if (onDeleteSuccess) onDeleteSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Delete Expense
          </DialogTitle>
          <DialogDescription>
            Removing "<strong>{expense.description}</strong>" for ₹{parseFloat(expense.amount).toFixed(2)}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive" className={cleanDelete && relatedSettlements.length > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200"}>
            {cleanDelete && relatedSettlements.length > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 font-bold" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="text-xs">
              {cleanDelete && relatedSettlements.length > 0 
                ? "Clean Delete active: Matching payments will be removed to keep balances at 0."
                : "Warning: Deleting this without cleaning matching payments will shift balances."}
            </AlertDescription>
          </Alert>

          {relatedSettlements.length > 0 ? (
            <div className="space-y-3 p-3 border rounded-lg bg-teal-50/30 border-teal-200 dark:border-teal-950">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="clean-delete" 
                  checked={cleanDelete} 
                  onCheckedChange={setCleanDelete}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="clean-delete" className="text-sm font-semibold cursor-pointer">
                    Clean Delete (Recommended)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    We found {relatedSettlements.length} matching payment(s). Deleting them together keeps everyone's balance at 0.
                  </p>
                </div>
              </div>
            </div>
          ) : (
             <p className="text-xs text-muted-foreground italic px-2">
               No matching payments found for this expense.
             </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExpenseDialog;
