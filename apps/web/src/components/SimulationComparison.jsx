import React, { useMemo } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const SimulationComparison = () => {
  const { members, expenses, settlements, simulationState, calculateBalances } = useGroup();

  const actualBalances = useMemo(() => calculateBalances(members, expenses, settlements), [members, expenses, settlements]);
  const simulatedBalances = useMemo(() => calculateBalances(members, simulationState.expenses, simulationState.settlements), [members, simulationState]);

  const getChange = (memberId) => {
    const actual = actualBalances.find(b => b.id === memberId)?.balance || 0;
    const sim = simulatedBalances.find(b => b.id === memberId)?.balance || 0;
    return sim - actual;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Actual Balances */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-3">
          <CardTitle className="text-base text-slate-700">Actual Balances</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {actualBalances.map(b => (
            <div key={b.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
              <span className="font-medium">{b.name}</span>
              <span className={`font-bold ${b.balance > 0 ? 'text-emerald-600' : b.balance < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {b.balance > 0 ? '+' : ''}₹{b.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Simulated Balances */}
      <Card className="border-purple-200 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
        <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-800 pb-3">
          <CardTitle className="text-base text-purple-800 dark:text-purple-300">Simulated Balances</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {simulatedBalances.map(b => {
            const change = getChange(b.id);
            const hasChanged = Math.abs(change) > 0.01;
            
            return (
              <motion.div 
                key={b.id} 
                initial={false}
                animate={{ backgroundColor: hasChanged ? 'rgba(168, 85, 247, 0.1)' : 'transparent' }}
                className={`flex justify-between items-center p-2 rounded-md transition-colors`}
              >
                <span className="font-medium">{b.name}</span>
                <div className="flex items-center gap-3">
                  {hasChanged && (
                    <span className={`text-xs flex items-center ${change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {change > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      ₹{Math.abs(change).toFixed(2)}
                    </span>
                  )}
                  <span className={`font-bold ${b.balance > 0 ? 'text-emerald-600' : b.balance < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {b.balance > 0 ? '+' : ''}₹{b.balance.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationComparison;