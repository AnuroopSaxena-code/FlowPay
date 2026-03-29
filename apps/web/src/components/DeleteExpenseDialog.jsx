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
import { Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebaseClient';
import { doc, deleteDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';

const DeleteExpenseDialog = ({ open, onOpenChange, expense, onDeleteSuccess }) => {
  const { currentGroupId, settlements, members, fetchGroupData } = useGroup();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteRelated, setDeleteRelated] = useState(true);

  // Find settlements that might be related to this expense
  const relatedSettlements = useMemo(() => {
    if (!expense || !settlements.length) return [];

    const amount = parseFloat(expense.amount);
    const shares = (expense.participants || []).map(p => ({
      memberId: p.memberId,
      amount: Math.round(amount * (parseFloat(p.percentage) / 100) * 100) / 100
    }));

    return settlements.filter(s => {
      if (s.status !== 'completed') return false;
      
      const share = shares.find(sh => sh.memberId === s.fromMemberId);
      const isToPayer = s.toMemberId === expense.payerId;
      
      if (!share || !isToPayer) return false;

      const amountDiff = Math.abs(parseFloat(s.amount) - share.amount);
      return amountDiff < 0.05;
    });
  }, [expense, settlements]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // 1. Delete associated settlements if selected
      if (deleteRelated && relatedSettlements.length > 0) {
        for (const s of relatedSettlements) {
          await deleteDoc(doc(db, "settlements", s.id));
        }
      }

      // 2. Delete the expense
      await deleteDoc(doc(db, "expenses", expense.id));

      toast({ 
        title: 'Success', 
        description: deleteRelated && relatedSettlements.length > 0 
          ? `Expense and ${relatedSettlements.length} related payment(s) deleted.` 
          : 'Expense deleted successfully.' 
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
            Are you sure you want to delete "<strong>{expense.description}</strong>"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Deleting this record will shift participant balances.
            </AlertDescription>
          </Alert>

          {relatedSettlements.length > 0 && (
            <div className="space-y-3 p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="delete-related" 
                  checked={deleteRelated} 
                  onCheckedChange={setDeleteRelated}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="delete-related"
                    className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Delete related payments too?
                  </label>
                  <p className="text-xs text-muted-foreground">
                    We found {relatedSettlements.length} completed payment(s) that seem to settle this expense.
                  </p>
                </div>
              </div>
              
              <div className="pl-7 space-y-1.5 border-l-2 border-amber-200 dark:border-amber-800 ml-2">
                {relatedSettlements.map(s => (
                  <div key={s.id} className="text-[11px] flex justify-between text-amber-700 dark:text-amber-400">
                    <span>{members.find(m => m.id === s.fromMemberId)?.name} paid ₹{parseFloat(s.amount).toFixed(2)}</span>
                    <span className="opacity-70">{s.created ? new Date(s.created.seconds * 1000).toLocaleDateString() : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
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
