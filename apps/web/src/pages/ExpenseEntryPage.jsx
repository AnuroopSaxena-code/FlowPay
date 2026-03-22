import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { Receipt, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const ExpenseEntryPage = () => {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState([]);
  const { members, expenses, addExpense, removeExpense } = useExpenseStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddExpense = (e) => {
    e.preventDefault();
    
    if (!payer) {
      toast({
        title: 'Select Payer',
        description: 'Please select who paid for this expense.',
        variant: 'destructive'
      });
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive'
      });
      return;
    }
    
    if (participants.length === 0) {
      toast({
        title: 'Select Participants',
        description: 'Please select at least one participant.',
        variant: 'destructive'
      });
      return;
    }
    
    addExpense({ payer, amount: amountNum, participants });
    setPayer('');
    setAmount('');
    setParticipants([]);
    toast({
      title: 'Expense Added',
      description: `Expense of ₹${amountNum.toFixed(2)} has been recorded.`
    });
  };

  const handleParticipantToggle = (memberId) => {
    setParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRemoveExpense = (id) => {
    removeExpense(id);
    toast({
      title: 'Expense Removed',
      description: 'The expense has been deleted.'
    });
  };

  const getMemberName = (id) => {
    return members.find(m => m.id === id)?.name || 'Unknown';
  };

  const handleViewSettlement = () => {
    if (expenses.length === 0) {
      toast({
        title: 'No Expenses',
        description: 'Please add at least one expense to view settlement.',
        variant: 'destructive'
      });
      return;
    }
    navigate('/settlement');
  };

  if (members.length === 0) {
    return (
      <>
        <Helmet>
          <title>Expense Entry - ExpenseFlow</title>
          <meta name="description" content="Record and track group expenses." />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
          <Header />
          <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">No Members Found</h1>
            <p className="text-xl text-gray-600 mb-8">Please add members first before recording expenses.</p>
            <Button onClick={() => navigate('/members')} className="bg-teal-600 hover:bg-teal-700">
              Go to Members Setup
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Expense Entry - ExpenseFlow</title>
        <meta name="description" content="Record and track group expenses." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Entry</h1>
            <p className="text-xl text-gray-600 mb-8">Record all group expenses and who participated</p>

            <Card className="rounded-xl shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-gray-900">Add New Expense</CardTitle>
                <CardDescription>Enter expense details and select participants</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Who Paid?
                      </label>
                      <Select value={payer} onValueChange={setPayer}>
                        <SelectTrigger className="text-gray-900">
                          <SelectValue placeholder="Select payer" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Who Participated?
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Checkbox
                            id={member.id}
                            checked={participants.includes(member.id)}
                            onCheckedChange={() => handleParticipantToggle(member.id)}
                          />
                          <label
                            htmlFor={member.id}
                            className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                          >
                            {member.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    <Receipt className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            {expenses.length > 0 && (
              <Card className="rounded-xl shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recorded Expenses ({expenses.length})</CardTitle>
                  <CardDescription>All expenses in this group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-900">Payer</TableHead>
                          <TableHead className="text-gray-900">Amount</TableHead>
                          <TableHead className="text-gray-900">Participants</TableHead>
                          <TableHead className="text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense, index) => (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <TableCell className="font-medium text-gray-900">
                              {getMemberName(expense.payer)}
                            </TableCell>
                            <TableCell className="text-gray-900">₹{expense.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-gray-600">
                              {expense.participants.map(id => getMemberName(id)).join(', ')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExpense(expense.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleViewSettlement}
                disabled={expenses.length === 0}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                View Settlement Plan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ExpenseEntryPage;