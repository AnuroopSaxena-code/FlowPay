import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { UserPlus, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const MemberSetupPage = () => {
  const [memberName, setMemberName] = useState('');
  const { members, addMember, removeMember } = useExpenseStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddMember = (e) => {
    e.preventDefault();
    
    const trimmedName = memberName.trim();
    
    if (!trimmedName) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter a member name.',
        variant: 'destructive'
      });
      return;
    }
    
    if (members.some(m => m.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({
        title: 'Duplicate Name',
        description: 'This member already exists.',
        variant: 'destructive'
      });
      return;
    }
    
    addMember(trimmedName);
    setMemberName('');
    toast({
      title: 'Member Added',
      description: `${trimmedName} has been added to the group.`
    });
  };

  const handleRemoveMember = (id, name) => {
    removeMember(id);
    toast({
      title: 'Member Removed',
      description: `${name} has been removed from the group.`
    });
  };

  const handleContinue = () => {
    if (members.length < 2) {
      toast({
        title: 'Not Enough Members',
        description: 'Please add at least 2 members to continue.',
        variant: 'destructive'
      });
      return;
    }
    navigate('/expenses');
  };

  return (
    <>
      <Helmet>
        <title>Members Setup - ExpenseFlow</title>
        <meta name="description" content="Add and manage group members for expense tracking." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Members Setup</h1>
            <p className="text-xl text-gray-600 mb-8">Add all members who will be part of this expense group</p>

            <Card className="rounded-xl shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-gray-900">Add New Member</CardTitle>
                <CardDescription>Enter the name of each person in your group</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMember} className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Enter member name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="flex-1 text-gray-900"
                  />
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </form>
              </CardContent>
            </Card>

            {members.length > 0 && (
              <Card className="rounded-xl shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-gray-900">Group Members ({members.length})</CardTitle>
                  <CardDescription>All members in your expense group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg font-medium text-gray-900">{member.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={members.length < 2}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                Continue to Expenses
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MemberSetupPage;