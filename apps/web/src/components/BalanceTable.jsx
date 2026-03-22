import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const BalanceTable = () => {
  const { currentGroupId } = useGroup();
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentGroupId) {
      calculateBalances();
    }
  }, [currentGroupId]);

  const calculateBalances = async () => {
    setLoading(true);
    try {
      // Fetch members and expenses
      const [members, expenses] = await Promise.all([
        pb.collection('members').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false }),
        pb.collection('expenses').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false })
      ]);

      // Initialize balances
      const memberBalances = {};
      members.forEach(m => {
        memberBalances[m.id] = { id: m.id, name: m.name, balance: 0 };
      });

      // Calculate from expenses
      expenses.forEach(exp => {
        const amount = parseFloat(exp.amount);
        
        // Credit payer
        if (memberBalances[exp.payerId]) {
          memberBalances[exp.payerId].balance += amount;
        }

        // Debit participants based on percentage
        if (exp.participants && Array.isArray(exp.participants)) {
          exp.participants.forEach(p => {
            if (memberBalances[p.memberId]) {
              const share = amount * (parseFloat(p.percentage) / 100);
              memberBalances[p.memberId].balance -= share;
            }
          });
        }
      });

      const balanceArray = Object.values(memberBalances).map(b => ({
        ...b,
        balance: Math.round(b.balance * 100) / 100 // Round to 2 decimals
      }));

      setBalances(balanceArray.sort((a, b) => b.balance - a.balance));

      // Calculate minimal settlements
      const debtors = balanceArray.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
      const creditors = balanceArray.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
      
      const plan = [];
      let i = 0, j = 0;
      
      while (i < debtors.length && j < creditors.length) {
        const debtor = { ...debtors[i] };
        const creditor = { ...creditors[j] };
        
        const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
        
        if (amount > 0.01) {
          plan.push({
            from: debtor.name,
            to: creditor.name,
            amount: Math.round(amount * 100) / 100
          });
        }
        
        debtors[i].balance += amount;
        creditors[j].balance -= amount;
        
        if (Math.abs(debtors[i].balance) < 0.01) i++;
        if (creditors[j].balance < 0.01) j++;
      }
      
      setSettlements(plan);

    } catch (error) {
      console.error('Error calculating balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentGroupId) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Net Balances</CardTitle>
          <CardDescription>Who owes and who is owed</CardDescription>
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
                    <TableCell className="font-medium">{b.name}</TableCell>
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
          <CardDescription>Minimal payments to settle all debts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-20 flex items-center justify-center text-muted-foreground">Calculating...</div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">All Settled Up!</p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">No payments needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-rose-600 dark:text-rose-400">{s.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{s.to}</span>
                  </div>
                  <span className="font-bold text-lg">₹{s.amount.toFixed(2)}</span>
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