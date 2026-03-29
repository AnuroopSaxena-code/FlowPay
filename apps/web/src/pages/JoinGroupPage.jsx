import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const JoinGroupPage = () => {
  const { inviteCode } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const { fetchGroups, switchGroup } = useGroup();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      fetchGroupInfo();
    }
  }, [inviteCode, currentUser]);

  const fetchGroupInfo = async () => {
    try {
      setLoading(true);
      const record = await pb.collection('groups').getFirstListItem(`inviteCode = "${inviteCode}"`, {
        $autoCancel: false
      });
      setGroup(record);
      
      // Check if user is already a participant
      if (currentUser && record.participants.includes(currentUser.id)) {
        setAlreadyJoined(true);
      }
    } catch (error) {
      console.error('Error fetching group info:', error);
      toast({ title: 'Error', description: 'Invalid or expired invite link.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirectTo=/join/${inviteCode}`);
      return;
    }

    setIsJoining(true);
    try {
      // Add user to participants list
      const updatedParticipants = [...new Set([...group.participants, currentUser.id])];
      
      await pb.collection('groups').update(group.id, {
        participants: updatedParticipants
      }, { $autoCancel: false });

      toast({ title: 'Welcome!', description: `You have successfully joined ${group.name}.` });
      
      // Refresh groups list and switch to this group
      await fetchGroups();
      switchGroup(group.id);
      
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Could not join group. Please try again.', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Invite link not found</h2>
        <p className="text-muted-foreground mb-8">This invite link might be expired or incorrect.</p>
        <Button asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Join Group - FlowPay</title>
      </Helmet>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-teal-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <CardTitle className="text-2xl font-bold">You're invited!</CardTitle>
            <CardDescription className="text-base pt-2">
              You've been invited to join the group <strong>"{group.name}"</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {!isAuthenticated ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300 text-center mb-4">
                  You need an account to join this group.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline">
                    <Link to={`/login?redirectTo=/join/${inviteCode}`}>Sign In</Link>
                  </Button>
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link to={`/signup?redirectTo=/join/${inviteCode}`}>Sign Up</Link>
                  </Button>
                </div>
              </div>
            ) : alreadyJoined ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 py-3 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" /> Already a member
                </div>
                <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                  <Link to="/dashboard" className="flex items-center justify-center">
                    Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleJoin} 
                className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20"
                disabled={isJoining}
              >
                {isJoining ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                Join "{group.name}"
              </Button>
            )}
            
            <p className="text-xs text-center text-muted-foreground">
              By joining, you will be able to see all expenses and add your own.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default JoinGroupPage;
