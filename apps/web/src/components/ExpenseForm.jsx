import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SplitSquareHorizontal } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other'];

const ExpenseForm = ({ expenseToEdit, onSuccess, onCancel }) => {
  const { currentGroupId } = useGroup();
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
        date: expenseToEdit.date ? expenseToEdit.date.split(' ')[0] : new Date().toISOString().split('T')[0],
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
    }
  }, [expenseToEdit, members]);

  const fetchMembers = async () => {
    try {
      const records = await pb.collection('members').getFullList({
        filter: `groupId = "${currentGroupId}"`,
        $autoCancel: false
      });
      setMembers(records);
      
      // Initialize equal splits if not editing
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

  const totalPercentage = Object.values(splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.1;
  const currentTotalAmount = (parseFloat(formData.amount) || 0) * (totalPercentage / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGroupId) return;
    
    if (!isPercentageValid) {
      return toast({ title: 'Invalid Splits', description: `Percentages must sum to 100%. Current sum: ${totalPercentage.toFixed(1)}%`, variant: 'destructive' });
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
        date: formData.date ? `${formData.date} 12:00:00.000Z` : null
      };

      if (expenseToEdit) {
        await pb.collection('expenses').update(expenseToEdit.id, data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Expense updated' });
      } else {
        await pb.collection('expenses').create(data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Expense added' });
        // Reset form
        setFormData({ ...formData, amount: '', description: '', notes: '' });
        setEqualSplits();
      }
      
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
              <label className="text-sm font-medium">Who Paid?</label>
              <Select value={formData.payerId} onValueChange={v => setFormData({...formData, payerId: v})} required>
                <SelectTrigger><SelectValue placeholder="Select payer" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
                          type="number" step="0.01" min="0" max="100"
                          value={splits[m.id] !== undefined ? Number(splits[m.id].toFixed(4)) : ''} 
                          onChange={e => handleSplitChange(m.id, e.target.value)}
                          className="h-8 text-right bg-white dark:bg-slate-950"
                        />
                        <span className="text-sm font-medium text-muted-foreground w-4">%</span>
                      </div>

                      <div className="flex items-center gap-2 w-32">
                        <span className="text-sm font-medium text-muted-foreground">₹</span>
                        <Input 
                          type="number" step="0.01" min="0"
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