import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ExpensesPage = () => {
  const { currentGroupId } = useGroup();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  if (!currentGroupId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">No Group Selected</h2>
        <p className="text-muted-foreground">Please select or create a group from the Dashboard first.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Expenses - FlowPay</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Expenses</h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <ExpenseForm 
              expenseToEdit={editingExpense} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          </div>
        )}

        <ExpenseList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      </div>
    </>
  );
};

export default ExpensesPage;