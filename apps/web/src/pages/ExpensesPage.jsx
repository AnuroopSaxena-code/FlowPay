import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ExpensesPage = () => {
  const { currentGroupId, loading } = useGroup();
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
      <div className="container mx-auto px-4 sm:px-8 py-8 md:py-12 max-w-5xl bg-background/95 backdrop-blur-3xl shadow-xl dark:shadow-none border-x border-border/20 dark:border-transparent min-h-screen">
        <div className="flex justify-between items-center mb-8">
          {loading ? (
            <>
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Expenses</h1>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
              )}
            </>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
};

export default ExpensesPage;