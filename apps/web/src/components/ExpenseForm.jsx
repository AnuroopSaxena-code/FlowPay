import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseClient';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SplitSquareHorizontal, Plus } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other'];

const ExpenseForm = ({ expenseToEdit, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { currentGroupId, fetchGroupData } = useGroup();
  const { toast } = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    payerId: '',
    amount: '',
    category: 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [splits, setSplits] = useState({}); // { memberId: percentage }
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' or 'custom'
  const [payers, setPayers] = useState({}); // { memberId: amount }
  const [isMultiPayer, setIsMultiPayer] = useState(false);

  useEffect(() => {
    if (currentGroupId) fetchMembers();
  }, [currentGroupId]);

  useEffect(() => {
    if (expenseToEdit && members.length > 0) {
      setFormData({
        payerId: expenseToEdit.payerId,
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category || 'Other',
        description: expenseToEdit.description || '',
        date: expenseToEdit.date || new Date().toISOString().split('T')[0],
        notes: expenseToEdit.notes || ''
      });
      
      if (expenseToEdit.participants) {
        const newSplits = {};
        let isEqual = true;
        const expectedEqual = 100 / expenseToEdit.participants.length;
        
        expenseToEdit.participants.forEach(p => {
          newSplits[p.memberId] = p.percentage;
          if (Math.abs(p.percentage - expectedEqual) > 0.1) isEqual = false;
        });
        
        setSplits(newSplits);
        setSplitMode(isEqual && expenseToEdit.participants.length === members.length ? 'equal' : 'custom');
      }

      if (expenseToEdit.payers && Array.isArray(expenseToEdit.payers)) {
        const newPayers = {};
        expenseToEdit.payers.forEach(p => newPayers[p.memberId] = p.amount);
        setPayers(newPayers);
        setIsMultiPayer(expenseToEdit.payers.length > 1);
      } else {
        setPayers({ [expenseToEdit.payerId]: expenseToEdit.amount });
        setIsMultiPayer(false);
      }
    }
  }, [expenseToEdit, members]);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, "members"), where("groupId", "==", currentGroupId));
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(records);
      
      if (!expenseToEdit && records.length > 0) {
        const equalPct = 100 / records.length;
        const initialSplits = {};
        records.forEach(m => initialSplits[m.id] = equalPct);
        setSplits(initialSplits);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSplitChange = (memberId, value) => {
    const numValue = parseFloat(value) || 0;
    setSplits(prev => ({ ...prev, [memberId]: numValue }));
    setSplitMode('custom');
  };

  const setEqualSplits = () => {
    const equalPct = 100 / members.length;
    const newSplits = {};
    members.forEach(m => newSplits[m.id] = equalPct);
    setSplits(newSplits);
    setSplitMode('equal');
  };

  const handleAmountChange = (memberId, value) => {
    const totalAmount = parseFloat(formData.amount) || 0;
    if (totalAmount <= 0) return;

    const numValue = parseFloat(value) || 0;
    const percentage = (numValue / totalAmount) * 100;
    
    setSplits(prev => ({ ...prev, [memberId]: percentage }));
    setSplitMode('custom');
  };

  const handlePayerAmountChange = (memberId, value) => {
    const numValue = parseFloat(value) || 0;
    setPayers(prev => ({ ...prev, [memberId]: numValue }));
    if (!isMultiPayer) setIsMultiPayer(true);
  };

  const totalPaid = Object.values(payers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const isPaidSumValid = Math.abs(totalPaid - (parseFloat(formData.amount) || 0)) < 0.1;

  const totalPercentage = Object.values(splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.1;
  const currentTotalAmount = (parseFloat(formData.amount) || 0) * (totalPercentage / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGroupId) return;
    
    if (!isPercentageValid) {
      return toast({ title: 'Invalid Splits', description: `Percentages must sum to 100%. Current sum: ${totalPercentage.toFixed(1)}%`, variant: 'destructive' });
    }

    if (isMultiPayer && !isPaidSumValid) {
      return toast({ title: 'Invalid Payer Amounts', description: `Total amount paid (₹${totalPaid.toFixed(2)}) must equal the expense total (₹${parseFloat(formData.amount).toFixed(2)})`, variant: 'destructive' });
    }

    setLoading(true);
    try {
      const participants = Object.entries(splits)
        .filter(([_, pct]) => pct > 0)
        .map(([memberId, percentage]) => ({ memberId, percentage: parseFloat(percentage) }));

      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        groupId: currentGroupId,
        participants,
        updated: serverTimestamp()
      };

      if (isMultiPayer) {
        data.payers = Object.entries(payers)
          .filter(([_, amt]) => amt > 0)
          .map(([memberId, amount]) => ({ memberId, amount: parseFloat(amount) }));
        // Still keep first payer for legacy display/compatibility
        data.payerId = data.payers[0]?.memberId || '';
      } else {
        data.payers = [{ memberId: formData.payerId, amount: parseFloat(formData.amount) }];
      }

      if (expenseToEdit) {
        await updateDoc(doc(db, "expenses", expenseToEdit.id), data);
        toast({ title: 'Success', description: 'Expense updated' });
      } else {
        await addDoc(collection(db, "expenses"), {
          ...data,
          created: serverTimestamp()
        });
        toast({ title: 'Success', description: 'Expense added' });
        setFormData({ ...formData, amount: '', description: '', notes: '' });
        setEqualSplits();
      }
      
      await fetchGroupData();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (members.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Please add members to the group first.</div>;
  }

  return (
    <Card className="border-teal-100 dark:border-teal-900 shadow-md bg-white dark:bg-slate-950">
      <CardHeader className="bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-100 dark:border-teal-900">
        <CardTitle>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Dinner at Mario's" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="space-y-3 border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-teal-50/10 dark:bg-teal-950/5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" /> Who Paid?
              </label>
              <Button 
                type="button" variant="outline" size="sm" 
                onClick={() => {
                  setIsMultiPayer(!isMultiPayer);
                  if (!isMultiPayer && formData.payerId) {
                    setPayers({ [formData.payerId]: parseFloat(formData.amount) || 0 });
                  }
                }}
                className={isMultiPayer ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30' : ''}
              >
                {isMultiPayer ? 'Back to Single Payer' : 'Split Payer'}
              </Button>
            </div>

            {!isMultiPayer ? (
              <Select value={formData.payerId} onValueChange={v => {
                setFormData({...formData, payerId: v});
                setPayers({ [v]: parseFloat(formData.amount) || 0 });
              }} required>
                <SelectTrigger><SelectValue placeholder="Select one person who paid" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 py-1">
                    <span className="flex-1 text-sm">{m.name}</span>
                    <div className="flex items-center gap-2 w-32">
                      <span className="text-sm text-muted-foreground">₹</span>
                      <Input 
                        type="number" step="any" min="0" 
                        value={payers[m.id] || ''} 
                        onChange={e => handlePayerAmountChange(m.id, e.target.value)}
                        className="h-8 text-right"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
                <div className={`flex justify-between items-center text-xs pt-2 border-t mt-2 ${isPaidSumValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span>Total Paid:</span>
                  <span className="font-bold">₹{totalPaid.toFixed(2)} / ₹{parseFloat(formData.amount) || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <SplitSquareHorizontal className="w-4 h-4" /> Split Details
              </label>
              <Button type="button" variant="outline" size="sm" onClick={setEqualSplits} className={splitMode === 'equal' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' : ''}>
                Split Equally
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {members.map(m => {
                const percValue = splits[m.id] || 0;
                const amtValue = ((parseFloat(formData.amount) || 0) * (percValue / 100));

                return (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-1">
                    <span className="flex-1 text-sm font-medium sm:font-normal truncate">{m.name}</span>
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      
                      <div className="flex items-center gap-2 w-28">
                        <Input 
                          type="number" step="any" min="0" max="100"
                          value={splits[m.id] !== undefined ? Number(splits[m.id].toFixed(4)) : ''} 
                          onChange={e => handleSplitChange(m.id, e.target.value)}
                          className="h-8 text-right bg-white dark:bg-slate-950"
                        />
                        <span className="text-sm font-medium text-muted-foreground w-4">%</span>
                      </div>

                      <div className="flex items-center gap-2 w-32">
                        <span className="text-sm font-medium text-muted-foreground">₹</span>
                        <Input 
                          type="number" step="any" min="0"
                          value={amtValue ? Number(amtValue.toFixed(2)) : ''}
                          onChange={e => handleAmountChange(m.id, e.target.value)}
                          className="h-8 text-right bg-white dark:bg-slate-950"
                          disabled={!parseFloat(formData.amount)}
                          placeholder="0.00"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={`flex justify-between items-center text-sm font-medium pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 ${isPercentageValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <span>Current Split Sum:</span>
              <div className="flex items-center gap-4">
                <span className="w-28 flex justify-end pr-6">{totalPercentage.toFixed(1)}%</span>
                <span className="w-32 flex justify-end">₹{currentTotalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;