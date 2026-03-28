import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const SettlementList = () => {
  const { currentGroupId } = useGroup();
  const { toast } = useToast();
  
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  
  // Form state for manual settlement entry
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fromMemberId: '', toMemberId: '', amount: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (currentGroupId) {
      fetchData();
    }
  }, [currentGroupId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersData, settlementsData] = await Promise.all([
        pb.collection('members').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false }),
        pb.collection('settlements').getFullList({ filter: `groupId = "${currentGroupId}"`, sort: '-created', $autoCancel: false })
      ]);
      setMembers(membersData);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  const handleStatusToggle = async (settlement) => {
    const newStatus = settlement.status === 'completed' ? 'pending' : 'completed';
    const completedDate = newStatus === 'completed' ? new Date().toISOString() : null;
    
    try {
      await pb.collection('settlements').update(settlement.id, {
        status: newStatus,
        completedDate
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: `Marked as ${newStatus}` });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this settlement record?')) return;
    try {
      await pb.collection('settlements').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Record deleted' });
      fetchData();
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
      await pb.collection('settlements').create({
        groupId: currentGroupId,
        fromMemberId: formData.fromMemberId,
        toMemberId: formData.toMemberId,
        amount: parseFloat(formData.amount),
        date: formData.date ? `${formData.date} 12:00:00.000Z` : null,
        status: 'completed',
        completedDate: new Date().toISOString()
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Settlement recorded' });
      setShowForm(false);
      setFormData({ fromMemberId: '', toMemberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredSettlements = settlements.filter(s => filter === 'all' || s.status === filter);

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
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      {showForm && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="pt-6">
            <form onSubmit={handleAddManual} className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1 flex-1 min-w-[150px]">
                <label className="text-xs font-medium">Who Paid</label>
                <Select value={formData.fromMemberId} onValueChange={v => setFormData({...formData, fromMemberId: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[150px]">
                <label className="text-xs font-medium">To Whom</label>
                <Select value={formData.toMemberId} onValueChange={v => setFormData({...formData, toMemberId: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <CardDescription>Track payments made between members</CardDescription>
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
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredSettlements.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No settlements found.</TableCell></TableRow>
              ) : (
                filteredSettlements.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.date ? new Date(s.date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{getMemberName(s.fromMemberId)}</TableCell>
                    <TableCell className="font-medium">{getMemberName(s.toMemberId)}</TableCell>
                    <TableCell className="text-right font-bold">₹{s.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusToggle(s)}
                        className={`h-8 px-2 rounded-full text-xs ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                      >
                        {s.status === 'completed' ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</> : <><Clock className="w-3 h-3 mr-1" /> Pending</>}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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