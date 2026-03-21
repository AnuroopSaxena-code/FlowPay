import { useState, useEffect } from 'react';

const STORAGE_KEY = 'expense-dashboard-data';

export function useExpenseStore() {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setMembers(data.members || []);
        setExpenses(data.expenses || []);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, expenses }));
  }, [members, expenses]);

  const addMember = (name) => {
    const id = Date.now().toString();
    setMembers([...members, { id, name }]);
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    // Also remove from expenses
    setExpenses(expenses.filter(e => e.payer !== id && !e.participants.includes(id)));
  };

  const addExpense = ({ payer, amount, participants }) => {
    const id = Date.now().toString();
    setExpenses([...expenses, { id, payer, amount: parseFloat(amount), participants }]);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getBalances = () => {
    const balances = {};
    
    // Initialize balances
    members.forEach(member => {
      balances[member.id] = { name: member.name, balance: 0 };
    });

    // Calculate balances
    expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.participants.length;
      
      // Payer gets credited
      if (balances[expense.payer]) {
        balances[expense.payer].balance += expense.amount;
      }
      
      // Participants get debited their share
      expense.participants.forEach(participantId => {
        if (balances[participantId]) {
          balances[participantId].balance -= sharePerPerson;
        }
      });
    });

    return Object.entries(balances).map(([id, data]) => ({
      id,
      name: data.name,
      balance: data.balance
    }));
  };

  const getSettlementPlan = () => {
    const balances = getBalances();
    
    // Separate creditors and debtors
    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    
    const settlements = [];
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
      const debtor = { ...debtors[i] };
      const creditor = { ...creditors[j] };
      
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: amount
      });
      
      debtor.balance += amount;
      creditor.balance -= amount;
      
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
      
      debtors[i] = debtor;
      creditors[j] = creditor;
    }
    
    return settlements;
  };

  const resetAll = () => {
    setMembers([]);
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    members,
    expenses,
    addMember,
    removeMember,
    addExpense,
    removeExpense,
    getBalances,
    getSettlementPlan,
    resetAll
  };
}