import React, { useState, useMemo } from 'react';
import { db } from '@/lib/firebaseClient';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock, Trash2, Plus, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const SettlementList = () => {
  const { 
    currentGroupId, 
    calculateBalances, 
    calculateOptimalSettlements, 
    fetchGroupData,
    members,
    expenses,
    settlements
  } = useGroup();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState('all'); // all, pending, completed
  
  // Form state for manual settlement entry
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fromMemberId: '', toMemberId: '', amount: '', date: new Date().toISOString().split('T')[0] });

  // Calculate active debts and transform them into pending suggestions reactively
  const pendingSuggestions = useMemo(() => {
    if (!members.length) return [];
    
    const balances = calculateBalances(members, expenses, settlements);
    const suggestions = calculateOptimalSettlements(balances);
    
    return suggestions.map((s, i) => ({
      id: `suggestion_${i}`,
      fromMemberId: s.fromId,
      toMemberId: s.toId,
      amount: s.amount,
      status: 'pending',
      isSuggestion: true
    }));
  }, [members, expenses, settlements, calculateBalances, calculateOptimalSettlements]);


  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  const handleStatusToggle = async (settlement) => {
    const newStatus = settlement.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateDoc(doc(db, "settlements", settlement.id), {
        status: newStatus,
        completedDate: newStatus === 'completed' ? new Date().toISOString() : null,
        updated: serverTimestamp()
      });
      
      toast({ title: 'Success', description: `Marked as ${newStatus}` });
      await fetchGroupData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSettleSuggestion = async (suggestion) => {
    try {
      await addDoc(collection(db, "settlements"), {
        groupId: currentGroupId,
        fromMemberId: suggestion.fromMemberId,
        toMemberId: suggestion.toMemberId,
        amount: suggestion.amount,
        status: 'completed',
        completedDate: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        creatorId: currentUser?.uid,
        creatorName: currentUser?.displayName || currentUser?.email,
        created: serverTimestamp()
      });
      
      toast({ title: 'Success', description: 'Debt recorded and settled!' });
      await fetchGroupData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this settlement record?')) return;
    try {
      await deleteDoc(doc(db, "settlements", id));
      toast({ title: 'Success', description: 'Record deleted' });
      await fetchGroupData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (formData.fromMemberId === formData.toMemberId) {
      return toast({ title: 'Error', description: 'Payer and Payee cannot be the same', variant: 'destructive' });
    }
    
    try {
      await addDoc(collection(db, "settlements"), {
        groupId: currentGroupId,
        fromMemberId: formData.fromMemberId,
        toMemberId: formData.toMemberId,
        amount: parseFloat(formData.amount),
        date: formData.date || new Date().toISOString().split('T')[0],
        status: 'completed',
        completedDate: new Date().toISOString(),
        creatorId: currentUser?.uid,
        creatorName: currentUser?.displayName || currentUser?.email,
        created: serverTimestamp()
      });
      
      toast({ title: 'Success', description: 'Settlement recorded' });
      setShowForm(false);
      setFormData({ fromMemberId: '', toMemberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
      await fetchGroupData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const combinedRecords = [...pendingSuggestions, ...settlements];
  const filteredSettlements = combinedRecords.filter(s => filter === 'all' || s.status === filter);

  if (!currentGroupId) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} size="sm">All</Button>
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} size="sm">Pending</Button>
          <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')} size="sm">Completed</Button>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
          <Plus className="w-4 h-4 mr-2" /> Record Manual Payment
        </Button>
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="pt-6">
            <form onSubmit={handleAddManual} className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1 flex-1 min-w-[150px]">
                <label className="text-xs font-medium">Who Paid</label>
                <Select value={formData.fromMemberId} onValueChange={v => setFormData({...formData, fromMemberId: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select payer" /></SelectTrigger>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[150px]">
                <label className="text-xs font-medium">To Whom</label>
                <Select value={formData.toMemberId} onValueChange={v => setFormData({...formData, toMemberId: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select receiver" /></SelectTrigger>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1 w-32">
                <label className="text-xs font-medium">Amount (₹)</label>
                <Input type="number" step="0.01" min="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="space-y-1 w-40">
                <label className="text-xs font-medium">Date</label>
                <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save It</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <CardDescription>Track payments made between members and see what's pending</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettlements.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found for this filter.</TableCell></TableRow>
              ) : (
                filteredSettlements.map(s => (
                  <TableRow key={s.id} className={s.isSuggestion ? "bg-amber-50/30 dark:bg-amber-950/20" : ""}>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.date ? new Date(s.date).toLocaleDateString() : (s.isSuggestion ? '-' : '-')}
                    </TableCell>
                    <TableCell className="font-medium">{getMemberName(s.fromMemberId)}</TableCell>
                    <TableCell className="font-medium">{getMemberName(s.toMemberId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold">₹{s.amount.toFixed(2)}</div>
                      {!s.isSuggestion && s.creatorName && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          By {s.creatorName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.isSuggestion ? (
                        <div className="flex items-center justify-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3 h-3" /> Auto-Calculated
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleStatusToggle(s)}
                          className={`h-8 px-2 rounded-full text-xs ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {s.status === 'completed' ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</> : <><Clock className="w-3 h-3 mr-1" /> Pending</>}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.isSuggestion ? (
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => handleSettleSuggestion(s)}
                          className="h-8 px-3 rounded-full text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Settle Up
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementList;