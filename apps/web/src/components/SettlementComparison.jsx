import React, { useMemo } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettlementComparison = () => {
  const { members, expenses, settlements, simulationState, calculateBalances, calculateOptimalSettlements } = useGroup();

  const actualBalances = useMemo(() => calculateBalances(members, expenses, settlements), [members, expenses, settlements]);
  const simulatedBalances = useMemo(() => calculateBalances(members, simulationState.expenses, simulationState.settlements), [members, simulationState]);

  const actualPlan = useMemo(() => calculateOptimalSettlements(actualBalances), [actualBalances]);
  const simulatedPlan = useMemo(() => calculateOptimalSettlements(simulatedBalances), [simulatedBalances]);

  // Consolidate both plans to show resolved, new, changed, and unchanged debts
  const comparisonItems = useMemo(() => {
    const pairMap = new Map();

    actualPlan.forEach(p => {
      pairMap.set(`${p.fromId}-${p.toId}`, { key: `${p.fromId}-${p.toId}`, actual: p, simulated: null });
    });

    simulatedPlan.forEach(p => {
      const key = `${p.fromId}-${p.toId}`;
      if (pairMap.has(key)) {
        pairMap.get(key).simulated = p;
      } else {
        pairMap.set(key, { key, actual: null, simulated: p });
      }
    });

    return Array.from(pairMap.values());
  }, [actualPlan, simulatedPlan]);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Actual Settlements */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-3">
          <CardTitle className="text-base text-slate-700">Actual Required Payments</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {actualPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All settled up!</p>
          ) : (
            actualPlan.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-rose-600">{s.from}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-emerald-600">{s.to}</span>
                </div>
                <span className="font-bold">₹{s.amount.toFixed(2)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Simulated Settlements */}
      <Card className="border-purple-200 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
        <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-800 pb-3">
          <CardTitle className="text-base text-purple-800 dark:text-purple-300">Simulated Required Payments</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {simulatedPlan.length === 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-purple-600/70 text-center flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 mb-2 text-purple-400" />
                Simulation results in all debts totally settled!
              </motion.p>
            ) : null}

            {comparisonItems.map((item) => {
              const { actual, simulated, key } = item;

              if (actual && !simulated) {
                // Debt completely resolved
                return (
                  <motion.div 
                    key={key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 opacity-60 border-slate-200 dark:bg-slate-900/40 relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 h-[1.5px] bg-slate-400 dark:bg-slate-600 top-1/2 -translate-y-1/2 z-10 w-full" />
                    <div className="flex items-center gap-2 text-sm relative z-0">
                      <span className="font-medium text-slate-500 dark:text-slate-400">{actual.from}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-500 dark:text-slate-400">{actual.to}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded ml-2">Resolved</span>
                    </div>
                    <span className="font-bold text-slate-400 relative z-0">₹{actual.amount.toFixed(2)}</span>
                  </motion.div>
                );
              }

              if (!actual && simulated) {
                // Completely new debt formulated
                return (
                  <motion.div 
                    key={key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-rose-600 dark:text-rose-400">{simulated.from}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{simulated.to}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded ml-2">New</span>
                    </div>
                    <span className="font-bold text-purple-900 dark:text-purple-100">₹{simulated.amount.toFixed(2)}</span>
                  </motion.div>
                );
              }

              if (actual && simulated) {
                // Debt changed or remained the same
                const diff = simulated.amount - actual.amount;
                const changed = Math.abs(diff) > 0.01;
                const statusClass = changed 
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" 
                  : "bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-800";
                
                const badge = changed ? (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 ${diff > 0 ? 'text-rose-600 bg-rose-100' : 'text-emerald-600 bg-emerald-100'}`}>
                    {diff > 0 ? '+' : ''}₹{diff.toFixed(2)}
                  </span>
                ) : null;

                return (
                  <motion.div 
                    key={key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${statusClass} transition-colors`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-rose-600 dark:text-rose-400">{simulated.from}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{simulated.to}</span>
                      {badge}
                    </div>
                    <span className="font-bold text-purple-900 dark:text-purple-100">₹{simulated.amount.toFixed(2)}</span>
                  </motion.div>
                );
              }

              return null;
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementComparison;