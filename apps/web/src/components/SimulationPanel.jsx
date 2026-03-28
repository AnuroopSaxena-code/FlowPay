import React, { useState } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Receipt, SplitSquareHorizontal, AlertCircle } from 'lucide-react';

const SimulationPanel = () => {
  const { members, currentGroupId, addSimulationAction } = useGroup();
  const { toast } = useToast();
  
  // Payment State
  const [payFrom, setPayFrom] = useState('');
  const [payTo, setPayTo] = useState('');
  const [payAmount, setPayAmount] = useState('');

  // Expense State
  const [expPayer, setExpPayer] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Other');
  const [expParticipants, setExpParticipants] = useState([]);

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!payFrom || !payTo || !payAmount) return;
    if (payFrom === payTo) {
      return toast({ title: 'Validation Error', description: 'Payer and Payee cannot be the same.', variant: 'destructive' });
    }
    const amount = parseFloat(payAmount);
    if (amount <= 0) {
      return toast({ title: 'Validation Error', description: 'Amount must be greater than 0.', variant: 'destructive' });
    }

    const fromName = members.find(m => m.id === payFrom)?.name;
    const toName = members.find(m => m.id === payTo)?.name;

    addSimulationAction('payment', {
      groupId: currentGroupId,
      fromMemberId: payFrom,
      toMemberId: payTo,
      amount: amount,
      date: new Date().toISOString()
    }, `${fromName} pays ${toName} ₹${amount.toFixed(2)}`);

    setPayFrom(''); setPayTo(''); setPayAmount('');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expPayer || !expAmount || expParticipants.length === 0) {
      return toast({ title: 'Validation Error', description: 'Please fill all required fields and select at least one participant.', variant: 'destructive' });
    }
    const amount = parseFloat(expAmount);
    if (amount <= 0) {
      return toast({ title: 'Validation Error', description: 'Amount must be greater than 0.', variant: 'destructive' });
    }

    const percentage = 100 / expParticipants.length;
    const participantsData = expParticipants.map(id => ({ memberId: id, percentage }));
    const payerName = members.find(m => m.id === expPayer)?.name;

    addSimulationAction('expense', {
      groupId: currentGroupId,
      payerId: expPayer,
      amount: amount,
      category: expCategory,
      description: 'Simulated Expense',
      participants: participantsData,
      date: new Date().toISOString()
    }, `${payerName} paid ₹${amount.toFixed(2)} for ${expParticipants.length} people`);

    setExpPayer(''); setExpAmount(''); setExpParticipants([]);
  };

  const toggleParticipant = (id) => {
    setExpParticipants(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <Card className="border-purple-200 dark:border-purple-900 shadow-md bg-purple-50/30 dark:bg-purple-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <SplitSquareHorizontal className="w-5 h-5" />
          Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-purple-100/50 dark:bg-purple-900/20">
            <TabsTrigger value="payment" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Test Payment</TabsTrigger>
            <TabsTrigger value="expense" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Test Expense</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment">
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">From</label>
                  <Select value={payFrom} onValueChange={setPayFrom}>
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="pb-2 hidden sm:block"><ArrowRight className="w-4 h-4 text-purple-400" /></div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">To</label>
                  <Select value={payTo} onValueChange={setPayTo}>
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-full sm:w-32">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Amount (₹)</label>
                  <Input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="border-purple-200 focus-visible:ring-purple-500" />
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">Simulate</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="expense">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Payer</label>
                  <Select value={expPayer} onValueChange={setExpPayer}>
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Amount (₹)</label>
                  <Input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="border-purple-200 focus-visible:ring-purple-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Split Equally Among:</label>
                <div className="flex flex-wrap gap-3 p-3 border border-purple-100 dark:border-purple-800 rounded-md bg-white/50 dark:bg-slate-900/50">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center space-x-2">
                      <Checkbox id={`sim-p-${m.id}`} checked={expParticipants.includes(m.id)} onCheckedChange={() => toggleParticipant(m.id)} className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                      <label htmlFor={`sim-p-${m.id}`} className="text-sm cursor-pointer">{m.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Simulate Expense</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SimulationPanel;