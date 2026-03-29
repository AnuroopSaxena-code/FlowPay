import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

const GroupContext = createContext();

export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(localStorage.getItem('currentGroupId') || null);
  const [loading, setLoading] = useState(true);

  // Actual Data State
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);

  // Simulation State
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationState, setSimulationState] = useState({ expenses: [], settlements: [] });
  const [simulationHistory, setSimulationHistory] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchGroups();
    } else {
      setGroups([]);
      setCurrentGroupId(null);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentGroupId) {
      fetchGroupData();
    } else {
      setMembers([]);
      setExpenses([]);
      setSettlements([]);
    }
  }, [currentGroupId]);

  const fetchGroups = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // Filter groups where the current user is either the owner OR a participant
      const filter = `owner = "${currentUser.id}" || participants ~ "${currentUser.id}"`;
      
      const records = await pb.collection('groups').getFullList({
        filter: filter,
        sort: '-created',
        $autoCancel: false
      });
      setGroups(records);
      
      if (records.length > 0 && (!currentGroupId || !records.find(g => g.id === currentGroupId))) {
        setCurrentGroupId(records[0].id);
        localStorage.setItem('currentGroupId', records[0].id);
      } else if (records.length === 0) {
        setCurrentGroupId(null);
        localStorage.removeItem('currentGroupId');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupData = async () => {
    try {
      const [m, e, s] = await Promise.all([
        pb.collection('members').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false }),
        pb.collection('expenses').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false }),
        pb.collection('settlements').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false })
      ]);
      setMembers(m);
      setExpenses(e);
      setSettlements(s);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const switchGroup = (id) => {
    setCurrentGroupId(id);
    localStorage.setItem('currentGroupId', id);
    setSimulationMode(false);
  };

  // --- Core Calculation Algorithms ---
  const calculateBalances = (mems, exps, sets) => {
    const balances = {};
    mems.forEach(m => {
      balances[m.id] = { id: m.id, name: m.name, balance: 0 };
    });

    exps.forEach(exp => {
      const amount = parseFloat(exp.amount);
      if (balances[exp.payerId]) {
        balances[exp.payerId].balance += amount;
      }
      if (exp.participants && Array.isArray(exp.participants)) {
        exp.participants.forEach(p => {
          if (balances[p.memberId]) {
            const share = amount * (parseFloat(p.percentage) / 100);
            balances[p.memberId].balance -= share;
          }
        });
      }
    });

    // Factor in completed settlements
    sets.filter(s => s.status === 'completed').forEach(s => {
      const amount = parseFloat(s.amount);
      if (balances[s.fromMemberId]) balances[s.fromMemberId].balance += amount;
      if (balances[s.toMemberId]) balances[s.toMemberId].balance -= amount;
    });

    return Object.values(balances)
      .map(b => ({ ...b, balance: Math.round(b.balance * 100) / 100 }))
      .sort((a, b) => b.balance - a.balance);
  };

  const calculateOptimalSettlements = (balancesArray) => {
    const debtors = balancesArray.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = balancesArray.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    
    const plan = [];
    let i = 0, j = 0;
    
    // Deep copy to avoid mutating original array during calculation
    const dCopy = debtors.map(d => ({...d}));
    const cCopy = creditors.map(c => ({...c}));

    while (i < dCopy.length && j < cCopy.length) {
      const debtor = dCopy[i];
      const creditor = cCopy[j];
      
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      if (amount > 0.01) {
        plan.push({
          fromId: debtor.id,
          from: debtor.name,
          toId: creditor.id,
          to: creditor.name,
          amount: Math.round(amount * 100) / 100
        });
      }
      
      debtor.balance += amount;
      creditor.balance -= amount;
      
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }
    return plan;
  };

  // --- Simulation Functions ---
  const enterSimulationMode = () => {
    setSimulationMode(true);
    setSimulationState({ expenses: [...expenses], settlements: [...settlements] });
    setSimulationHistory([]);
    toast({ title: 'Simulation Mode Active', description: 'Changes will not be saved until applied.', className: 'bg-purple-600 text-white border-none' });
  };

  const exitSimulationMode = () => {
    setSimulationMode(false);
    setSimulationState({ expenses: [], settlements: [] });
    setSimulationHistory([]);
  };

  const discardSimulation = () => {
    setSimulationState({ expenses: [...expenses], settlements: [...settlements] });
    setSimulationHistory([]);
    toast({ title: 'Simulation Discarded', description: 'Reverted to actual data.' });
  };

  const resetSimulation = () => {
    setSimulationState({ expenses: [...expenses], settlements: [...settlements] });
    setSimulationHistory([]);
    toast({ title: 'Simulation Reset', description: 'Started a fresh simulation.' });
  };

  const addSimulationAction = (type, data, description) => {
    const newState = { ...simulationState };
    
    if (type === 'payment') {
      newState.settlements = [...newState.settlements, { ...data, id: `sim_set_${Date.now()}`, isSimulated: true, status: 'completed' }];
    } else if (type === 'expense') {
      newState.expenses = [...newState.expenses, { ...data, id: `sim_exp_${Date.now()}`, isSimulated: true }];
    }

    setSimulationState(newState);
    setSimulationHistory(prev => [...prev, { id: Date.now(), type, description, state: newState, timestamp: new Date() }]);
  };

  const jumpToHistory = (historyItem) => {
    setSimulationState(historyItem.state);
    // Truncate history after this point
    const index = simulationHistory.findIndex(h => h.id === historyItem.id);
    setSimulationHistory(simulationHistory.slice(0, index + 1));
  };

  const applySimulation = async () => {
    try {
      const newExpenses = simulationState.expenses.filter(e => e.isSimulated);
      const newSettlements = simulationState.settlements.filter(s => s.isSimulated);

      for (const exp of newExpenses) {
        const { id, isSimulated, ...dataToSave } = exp;
        await pb.collection('expenses').create(dataToSave, { $autoCancel: false });
      }

      for (const set of newSettlements) {
        const { id, isSimulated, ...dataToSave } = set;
        await pb.collection('settlements').create(dataToSave, { $autoCancel: false });
      }

      toast({ title: 'Simulation Applied', description: 'Changes have been saved successfully.', className: 'bg-emerald-600 text-white border-none' });
      await fetchGroupData(); // Refresh actual data
      exitSimulationMode();
    } catch (error) {
      toast({ title: 'Error applying simulation', description: error.message, variant: 'destructive' });
    }
  };

  const currentGroup = groups.find(g => g.id === currentGroupId) || null;

  return (
    <GroupContext.Provider value={{ 
      groups, currentGroup, currentGroupId, switchGroup, fetchGroups, loading,
      members, expenses, settlements, fetchGroupData,
      calculateBalances, calculateOptimalSettlements,
      simulationMode, simulationState, simulationHistory,
      enterSimulationMode, exitSimulationMode, discardSimulation, resetSimulation, addSimulationAction, jumpToHistory, applySimulation
    }}>
      {children}
    </GroupContext.Provider>
  );
};