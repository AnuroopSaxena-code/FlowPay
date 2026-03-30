import React, { useState, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, TrendingUp, TrendingDown, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const BalanceTable = () => {
  const { currentGroupId, members, expenses, settlements, calculateBalances, calculateOptimalSettlements, loading } = useGroup();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(null);

  const currentMember = useMemo(() => 
    members.find(m => m.userId === currentUser?.uid),
    [members, currentUser]
  );

  const handleNotify = async (s) => {
    const fromMember = members.find(m => m.id === s.fromId);
    const toMember = members.find(m => m.id === s.toId);
    
    if (!fromMember || !fromMember.email) return;

    setIsSending(s.fromId + '_' + s.toId);
    try {
      await emailjs.send(
        'service_5j2wm6l', 
        'template_27knelj', 
        {
          to_name: fromMember.name,
          from_name: toMember?.name || currentMember?.name,
          to_email: fromMember.email,
          from_email: currentUser?.email,
          amount: s.amount.toFixed(2),
          link: window.location.origin + '/settlements',
        }, 
        'Kk8WwPJRWRVJgrrS7'
      );
      toast({ title: 'Success!', description: `Nudge email sent to ${fromMember.name}.` });
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast({ title: 'Error', description: 'Failed to send automated email.', variant: 'destructive' });
    } finally {
      setIsSending(null);
    }
  };

  // Compute balances and optimal settlements reactively
  const { balances, suggestedSettlements } = useMemo(() => {
    if (!members.length) return { balances: [], suggestedSettlements: [] };
    
    const computedBalances = calculateBalances(members, expenses, settlements);
    const optimal = calculateOptimalSettlements(computedBalances);
    
    return { balances: computedBalances, suggestedSettlements: optimal };
  }, [members, expenses, settlements, calculateBalances, calculateOptimalSettlements]);

  if (!currentGroupId) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Net Balances</CardTitle>
          <CardDescription>Who owes and who is owed (factoring in all expenses and payments)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">Calculating...</div>
          ) : balances.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium max-w-[120px] truncate sm:max-w-none">{b.name}</TableCell>
                    <TableCell className={`text-right font-bold ${b.balance > 0 ? 'text-emerald-600' : b.balance < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {b.balance > 0 ? <TrendingUp className="w-4 h-4" /> : b.balance < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                        ₹{Math.abs(b.balance).toFixed(2)}
                        <span className="text-xs font-normal ml-1">
                          {b.balance > 0 ? '(Gets back)' : b.balance < 0 ? '(Owes)' : '(Settled)'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-100 dark:border-teal-900">
        <CardHeader>
          <CardTitle className="text-teal-800 dark:text-teal-300">Suggested Settlements</CardTitle>
          <CardDescription>Minimal payments to settle all outstanding debts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-20 flex items-center justify-center text-muted-foreground">Calculating...</div>
          ) : suggestedSettlements.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">All Settled Up!</p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">No payments needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedSettlements.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-rose-600 dark:text-rose-400 truncate max-w-[100px] sm:max-w-none">{s.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[100px] sm:max-w-none">{s.to}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 font-bold text-lg">
                    <span>₹{s.amount.toFixed(2)}</span>
                    {currentMember?.id === s.toId && members.find(m => m.id === s.fromId)?.email && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleNotify(s)} 
                        disabled={isSending === (s.fromId + '_' + s.toId)}
                        className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        title="Send automated email notification"
                      >
                        {isSending === (s.fromId + '_' + s.toId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceTable;