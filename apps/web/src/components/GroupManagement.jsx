import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Share2, CheckCircle2 } from 'lucide-react';

const GroupManagement = () => {
  const { currentUser } = useAuth();
  const { groups, currentGroupId, switchGroup, fetchGroups } = useGroup();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setLoading(true);
    try {
      await pb.collection('groups').create({
        name: formData.name,
        description: formData.description,
        owner: currentUser.id,
        participants: [currentUser.id],
        inviteCode: inviteCode
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Group created successfully' });
      setFormData({ name: '', description: '' });
      setIsCreating(false);
      await fetchGroups();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the group "${name}"? All associated members and expenses will be lost.`)) return;

    try {
      const expenses = await pb.collection('expenses').getFullList({ filter: `groupId = "${id}"`, $autoCancel: false });
      for (const exp of expenses) await pb.collection('expenses').delete(exp.id, { $autoCancel: false });
      
      const settlements = await pb.collection('settlements').getFullList({ filter: `groupId = "${id}"`, $autoCancel: false });
      for (const st of settlements) await pb.collection('settlements').delete(st.id, { $autoCancel: false });
      
      const members = await pb.collection('members').getFullList({ filter: `groupId = "${id}"`, $autoCancel: false });
      for (const m of members) await pb.collection('members').delete(m.id, { $autoCancel: false });

      await pb.collection('groups').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Group deleted' });
      await fetchGroups();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Groups</CardTitle>
          <CardDescription>Manage your expense sharing groups</CardDescription>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "default"} className={!isCreating ? "bg-teal-600 hover:bg-teal-700" : ""}>
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Group</>}
        </Button>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-6 space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div>
              <label className="text-sm font-medium mb-1 block">Group Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g., Summer Trip 2024" 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description..." 
                rows={2}
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No groups found. Create one to get started!</p>
          ) : (
            groups.map(group => (
              <div key={group.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${currentGroupId === group.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20' : 'hover:bg-muted/50'}`}>
                <div>
                  <h4 className="font-semibold">{group.name}</h4>
                  {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50" 
                    onClick={() => {
                      const link = `${window.location.origin}/join/${group.inviteCode}`;
                      navigator.clipboard.writeText(link);
                      toast({ title: 'Link Copied!', description: 'Invite link copied to clipboard. Send it to your friends!' });
                    }}
                    title="Copy Invite Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {currentGroupId !== group.id && (
                    <Button variant="secondary" size="sm" onClick={() => switchGroup(group.id)}>
                      Switch to
                    </Button>
                  )}
                  {currentGroupId === group.id && (
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded-full mr-2">Active</span>
                  )}
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDelete(group.id, group.name)}>
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

export default GroupManagement;