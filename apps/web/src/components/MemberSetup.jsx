import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Loader2, UserPlus } from 'lucide-react';

const MemberSetup = () => {
  const { currentUser } = useAuth();
  const { currentGroupId, currentGroup, fetchGroups, fetchGroupData } = useGroup();
  const { toast } = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  const isOwner = currentGroup?.owner === currentUser?.uid;

  useEffect(() => {
    if (currentGroupId) {
      fetchMembers();
    } else {
      setMembers([]);
    }
  }, [currentGroupId]);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, "members"), where("groupId", "==", currentGroupId));
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        await updateDoc(doc(db, "members", editingId), { 
          ...formData,
          updated: serverTimestamp() 
        });
        toast({ title: 'Success', description: 'Member updated' });
      } else {
        await addDoc(collection(db, "members"), {
          ...formData,
          groupId: currentGroupId,
          created: serverTimestamp()
        });
        toast({ title: 'Success', description: 'Member added' });
      }
      setFormData({ name: '', email: '' });
      setEditingId(null);
      await fetchMembers();
      await fetchGroupData();
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

  const handleDelete = async (memberDocId, memberName, memberUserId) => {
    if (!window.confirm(`Remove ${memberName} from the group?`)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. Clean up financial records
      const qPaid = query(collection(db, "expenses"), where("payerId", "==", memberDocId));
      const snapPaid = await getDocs(qPaid);
      snapPaid.docs.forEach(d => batch.delete(doc(db, "expenses", d.id)));

      const collectionsToClean = ['settlements'];
      for (const col of collectionsToClean) {
        const qFrom = query(collection(db, col), where("fromMemberId", "==", memberDocId));
        const snapFrom = await getDocs(qFrom);
        snapFrom.docs.forEach(d => batch.delete(doc(db, col, d.id)));

        const qTo = query(collection(db, col), where("toMemberId", "==", memberDocId));
        const snapTo = await getDocs(qTo);
        snapTo.docs.forEach(d => batch.delete(doc(db, col, d.id)));
      }

      // 2. Remove from group participants (THIS causes the group to disappear for THEM)
      if (memberUserId) {
        const groupRef = doc(db, "groups", currentGroupId);
        const groupSnap = await getDocs(query(collection(db, "groups"), where("__name__", "==", currentGroupId)));
        if (!groupSnap.empty) {
          const participants = groupSnap.docs[0].data().participants || [];
          batch.update(groupRef, {
            participants: participants.filter(uid => uid !== memberUserId)
          });
        }
      }

      // 3. Delete group member record
      batch.delete(doc(db, "members", memberDocId));

      await batch.commit();
      toast({ title: 'Success', description: 'Member removed and access revoked' });
      
      await fetchMembers();
      await fetchGroupData();
      if (memberUserId === currentUser.uid) {
         await fetchGroups(); // If I deleted myself (unlikely due to UI check, but safe)
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!currentGroupId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Group Members</span>
          <span className="text-sm font-normal bg-muted px-2 py-1 rounded-full">{members.length}</span>
        </CardTitle>
        <CardDescription>
          {isOwner ? "Manage member access and profiles" : "View people in this group"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOwner && (
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
        )}

        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">No members yet.</p>
          ) : (
            members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium flex items-center gap-2 truncate">
                    <span className="truncate">{member.name}</span>
                    {member.userId === currentGroup?.owner && (
                      <span className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-tighter font-bold flex-shrink-0">Owner</span>
                    )}
                  </span>
                  {member.email && <span className="text-xs text-muted-foreground truncate">{member.email}</span>}
                </div>
                {isOwner && member.userId !== currentUser.uid && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)} className="h-8 w-8">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id, member.name, member.userId)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberSetup;