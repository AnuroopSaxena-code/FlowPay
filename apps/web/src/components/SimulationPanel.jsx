import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const currentMember = useMemo(() => 
    members.find(m => m.userId === currentUser?.uid),
    [members, currentUser]
  );
  
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

    // Permission check: only participants can simulate payments
    if (currentMember?.id !== payFrom && currentMember?.id !== payTo) {
      return toast({ 
        title: 'Permission Denied', 
        description: 'You can only simulate payments where you are either the payer or the payee.', 
        variant: 'destructive' 
      });
    }

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

  // Expense Multi-Payer State
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [expPayers, setExpPayers] = useState({}); // { memberId: amount }

  const handlePayerAmountChange = (memberId, value) => {
    const numValue = parseFloat(value) || 0;
    setExpPayers(prev => ({ ...prev, [memberId]: numValue }));
  };

  const totalPaid = Object.values(expPayers).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(expAmount);
    if (!expAmount || amount <= 0 || expParticipants.length === 0) {
      return toast({ title: 'Validation Error', description: 'Please fill amount and select at least one participant.', variant: 'destructive' });
    }

    if (!isMultiPayer && !expPayer) {
      return toast({ title: 'Validation Error', description: 'Please select a payer.', variant: 'destructive' });
    }

    if (isMultiPayer && Math.abs(totalPaid - amount) > 0.01) {
      return toast({ title: 'Validation Error', description: `Total paid (₹${totalPaid.toFixed(2)}) must equal expense amount (₹${amount.toFixed(2)})`, variant: 'destructive' });
    }

    const percentage = 100 / expParticipants.length;
    const participantsData = expParticipants.map(id => ({ memberId: id, percentage }));

    let payersData = [];
    let payerName = '';

    if (isMultiPayer) {
      payersData = Object.entries(expPayers)
        .filter(([_, amt]) => amt > 0)
        .map(([memberId, amt]) => ({ memberId, amount: parseFloat(amt) }));
      payerName = `${payersData.length} members`;
    } else {
      payersData = [{ memberId: expPayer, amount: amount }];
      payerName = members.find(m => m.id === expPayer)?.name || 'Someone';
    }

    addSimulationAction('expense', {
      groupId: currentGroupId,
      payerId: isMultiPayer ? payersData[0].memberId : expPayer, // fallback for legacy
      payers: payersData,
      amount: amount,
      category: expCategory,
      description: 'Simulated Expense',
      participants: participantsData,
      date: new Date().toISOString()
    }, `${payerName} paid ₹${amount.toFixed(2)} for ${expParticipants.length} people`);

    setExpPayer(''); setExpAmount(''); setExpParticipants([]); setExpPayers({});
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
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Total Amount (₹)</label>
                  <Input type="number" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="border-purple-200 focus-visible:ring-purple-500" placeholder="0.00" />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-medium text-purple-900 dark:text-purple-200">Category</label>
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 p-3 border border-purple-100 dark:border-purple-900 rounded-md bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                    <Receipt className="w-3 h-3" /> Who Paid?
                  </label>
                  <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => setIsMultiPayer(!isMultiPayer)}
                    className="h-6 text-[10px] text-purple-600 hover:bg-purple-100"
                  >
                    {isMultiPayer ? 'Single Payer' : 'Split Payer'}
                  </Button>
                </div>

                {!isMultiPayer ? (
                  <Select value={expPayer} onValueChange={setExpPayer}>
                    <SelectTrigger className="border-purple-200 focus:ring-purple-500 h-8 text-sm"><SelectValue placeholder="Select Payer" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="flex-1 text-xs truncate">{m.name}</span>
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-[10px] text-muted-foreground">₹</span>
                          <Input 
                            type="number" step="any" min="0" 
                            value={expPayers[m.id] || ''} 
                            onChange={e => handlePayerAmountChange(m.id, e.target.value)}
                            className="h-7 text-right text-xs"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ))}
                    <div className={`flex justify-between items-center text-[10px] pt-1 border-t mt-1 ${Math.abs(totalPaid - (parseFloat(expAmount) || 0)) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span>Total: ₹{totalPaid.toFixed(2)}</span>
                      <span>Target: ₹{parseFloat(expAmount) || 0}</span>
                    </div>
                  </div>
                )}
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