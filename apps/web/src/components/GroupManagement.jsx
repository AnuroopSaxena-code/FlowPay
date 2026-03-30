import React, { useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Share2 } from 'lucide-react';

const GroupManagement = () => {
  const { currentUser } = useAuth();
  const { groups, currentGroupId, switchGroup, fetchGroups } = useGroup();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const [newGroupId, setNewGroupId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', nickname: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setLoading(true);
    try {
      const groupDoc = await addDoc(collection(db, "groups"), {
        name: formData.name,
        description: formData.description,
        owner: currentUser.uid,
        participants: [currentUser.uid],
        inviteCode: inviteCode,
        created: serverTimestamp()
      });
      
      setNewGroupId(groupDoc.id);
      setShowCreatorProfile(true);
      setFormData(prev => ({ ...prev, nickname: currentUser.displayName || '' }));
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishCreatorProfile = async (e) => {
    e.preventDefault();
    if (!formData.nickname.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "members"), {
        groupId: newGroupId,
        name: formData.nickname.trim(),
        userId: currentUser.uid,
        email: currentUser.email,
        isCreator: true,
        created: serverTimestamp()
      });

      toast({ title: 'Success', description: 'Group and your profile created!' });
      setFormData({ name: '', description: '', nickname: '' });
      setIsCreating(false);
      setShowCreatorProfile(false);
      await fetchGroups();
      switchGroup(newGroupId);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the group "${name}"? All associated members and expenses will be lost.`)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const collectionsToClean = ['expenses', 'settlements', 'members'];
      
      for (const colName of collectionsToClean) {
        const q = query(collection(db, colName), where("groupId", "==", id));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((d) => {
          batch.delete(doc(db, colName, d.id));
        });
      }

      batch.delete(doc(db, "groups", id));
      await batch.commit();
      
      toast({ title: 'Success', description: 'Group and all data deleted' });
      await fetchGroups();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (id, name) => {
    if (!window.confirm(`Are you sure you want to leave the group "${name}"?`)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. Remove from participants list
      const groupRef = doc(db, "groups", id);
      const groupSnap = await getDocs(query(collection(db, "groups"), where("__name__", "==", id)));
      if (!groupSnap.empty) {
        const participants = groupSnap.docs[0].data().participants || [];
        batch.update(groupRef, {
          participants: participants.filter(uid => uid !== currentUser.uid)
        });
      }

      // 2. Delete member document
      const memberQuery = query(
        collection(db, "members"), 
        where("groupId", "==", id), 
        where("userId", "==", currentUser.uid)
      );
      const memberSnap = await getDocs(memberQuery);
      memberSnap.docs.forEach(d => {
        batch.delete(doc(db, "members", d.id));
      });

      await batch.commit();
      toast({ title: 'Success', description: `You have left ${name}` });
      await fetchGroups();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Groups</CardTitle>
          <CardDescription>Manage your expense sharing groups</CardDescription>
        </div>
        {!showCreatorProfile && (
          <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "default"} className={!isCreating ? "bg-teal-600 hover:bg-teal-700" : ""}>
            {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Group</>}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isCreating && !showCreatorProfile && (
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

        {showCreatorProfile && (
          <form onSubmit={handleFinishCreatorProfile} className="mb-6 space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Step 2: Create your profile</h4>
            <p className="text-sm text-muted-foreground">How should others see you in <strong>{formData.name}</strong>?</p>
            <div>
              <Input 
                value={formData.nickname} 
                onChange={e => setFormData({...formData, nickname: e.target.value})} 
                placeholder="Your nickname" 
                required 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Join as Member
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No groups found. Create one to get started!</p>
          ) : (
            groups.map(group => (
              <div key={group.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${currentGroupId === group.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20' : 'hover:bg-muted/50'}`}>
                <div className="min-w-0 pr-2">
                  <h4 className="font-semibold truncate">{group.name}</h4>
                  {group.description && <p className="text-sm text-muted-foreground truncate">{group.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50" 
                    onClick={async () => {
                      let inviteCode = group.inviteCode;
                      if (!inviteCode) {
                        inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                        try { await updateDoc(doc(db, "groups", group.id), { inviteCode }); } catch (e) {}
                      }
                      const link = `${window.location.origin}/join/${inviteCode}`;
                      navigator.clipboard.writeText(link);
                      toast({ title: 'Link Copied!', description: 'Invite link copied to clipboard.' });
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
                  {group.owner === currentUser.uid ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50" 
                      onClick={() => handleDelete(group.id, group.name)}
                      disabled={loading}
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50" 
                      onClick={() => handleLeave(group.id, group.name)}
                      disabled={loading}
                    >
                      Leave
                    </Button>
                  )}
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