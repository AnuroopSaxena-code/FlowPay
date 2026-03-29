import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Loader2, UserPlus } from 'lucide-react';

const MemberSetup = () => {
  const { currentGroupId, fetchGroupData } = useGroup();
  const { toast } = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (currentGroupId) {
      fetchMembers();
    } else {
      setMembers([]);
    }
  }, [currentGroupId]);

  const fetchMembers = async () => {
    try {
      const records = await pb.collection('members').getFullList({
        filter: `groupId = "${currentGroupId}"`,
        sort: 'created',
        $autoCancel: false
      });
      setMembers(records);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !currentGroupId) return;

    setLoading(true);
    try {
      if (editingId) {
        await pb.collection('members').update(editingId, formData, { $autoCancel: false });
        toast({ title: 'Success', description: 'Member updated' });
      } else {
        await pb.collection('members').create({
          ...formData,
          groupId: currentGroupId
        }, { $autoCancel: false });
        toast({ title: 'Success', description: 'Member added' });
      }
      setFormData({ name: '', email: '' });
      setEditingId(null);
      await fetchMembers();
      await fetchGroupData(); // Sync global balances immediately
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({ name: member.name, email: member.email || '' });
    setEditingId(member.id);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the group? This might affect existing expenses.`)) return;

    try {
      const paidExpenses = await pb.collection('expenses').getFullList({ filter: `payerId = "${id}"`, $autoCancel: false });
      const deletedExpenseIds = new Set();
      for (const exp of paidExpenses) {
        await pb.collection('expenses').delete(exp.id, { $autoCancel: false });
        deletedExpenseIds.add(exp.id);
      }

      const settlements = await pb.collection('settlements').getFullList({ filter: `fromMemberId = "${id}" || toMemberId = "${id}"`, $autoCancel: false });
      for (const st of settlements) {
        await pb.collection('settlements').delete(st.id, { $autoCancel: false });
      }

      const allExpenses = await pb.collection('expenses').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false });
      for (const exp of allExpenses) {
        if (deletedExpenseIds.has(exp.id)) continue;
        
        try {
          const participants = typeof exp.participants === 'string' ? JSON.parse(exp.participants) : exp.participants;
          if (Array.isArray(participants) && participants.some(p => p.memberId === id)) {
            await pb.collection('expenses').delete(exp.id, { $autoCancel: false });
          }
        } catch(e) {}
      }

      await pb.collection('members').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Member removed' });
      await fetchMembers();
      await fetchGroupData(); // Sync global balances immediately
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (!currentGroupId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Group Members</span>
          <span className="text-sm font-normal bg-muted px-2 py-1 rounded-full">{members.length} members</span>
        </CardTitle>
        <CardDescription>Add people to split expenses with</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input 
            placeholder="Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
            className="flex-1"
          />
          <Input 
            type="email"
            placeholder="Email (optional)" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : <><UserPlus className="w-4 h-4 mr-2" /> Add</>)}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setFormData({name:'', email:''}); }}>
              Cancel
            </Button>
          )}
        </form>

        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">No members yet. Add yourself and others!</p>
          ) : (
            members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{member.name}</p>
                  {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)} className="h-8 w-8">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id, member.name)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberSetup;