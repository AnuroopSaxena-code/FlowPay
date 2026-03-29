import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebaseClient';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
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
      // Firebase UID is used here instead of PocketBase ID
      const q = query(
        collection(db, "groups"), 
        where("participants", "array-contains", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setGroups(records.sort((a, b) => (b.created?.seconds || 0) - (a.created?.seconds || 0)));
      
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
    if (!currentGroupId) return;
    try {
      const qMembers = query(collection(db, "members"), where("groupId", "==", currentGroupId));
      const qExpenses = query(collection(db, "expenses"), where("groupId", "==", currentGroupId));
      const qSettlements = query(collection(db, "settlements"), where("groupId", "==", currentGroupId));

      const [snapMembers, snapExpenses, snapSettlements] = await Promise.all([
        getDocs(qMembers),
        getDocs(qExpenses),
        getDocs(qSettlements)
      ]);

      setMembers(snapMembers.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setExpenses(snapExpenses.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSettlements(snapSettlements.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    const index = simulationHistory.findIndex(h => h.id === historyItem.id);
    setSimulationHistory(simulationHistory.slice(0, index + 1));
  };

  const applySimulation = async () => {
    try {
      const newExpenses = simulationState.expenses.filter(e => e.isSimulated);
      const newSettlements = simulationState.settlements.filter(s => s.isSimulated);

      const batch = writeBatch(db);

      for (const exp of newExpenses) {
        const { id, isSimulated, ...dataToSave } = exp;
        const newDocRef = doc(collection(db, "expenses"));
        batch.set(newDocRef, { ...dataToSave, created: serverTimestamp() });
      }

      for (const set of newSettlements) {
        const { id, isSimulated, ...dataToSave } = set;
        const newDocRef = doc(collection(db, "settlements"));
        batch.set(newDocRef, { ...dataToSave, created: serverTimestamp() });
      }

      await batch.commit();

      toast({ title: 'Simulation Applied', description: 'Changes have been saved successfully.', className: 'bg-emerald-600 text-white border-none' });
      await fetchGroupData();
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