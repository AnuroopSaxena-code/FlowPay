import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { TrendingUp, TrendingDown, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const SettlementResultsPage = () => {
  const { members, expenses, getBalances, getSettlementPlan, resetAll } = useExpenseStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const balances = getBalances();
  const settlements = getSettlementPlan();

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear all members and expenses.')) {
      resetAll();
      toast({
        title: 'Data Reset',
        description: 'All data has been cleared.'
      });
      navigate('/members');
    }
  };

  if (members.length === 0 || expenses.length === 0) {
    return (
      <>
        <Helmet>
          <title>Settlement Results - ExpenseFlow</title>
          <meta name="description" content="View balances and settlement plan for your group expenses." />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
          <Header />
          <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">No Data Available</h1>
            <p className="text-xl text-gray-600 mb-8">
              {members.length === 0 
                ? 'Please add members first.' 
                : 'Please add expenses to view settlement results.'}
            </p>
            <Button 
              onClick={() => navigate(members.length === 0 ? '/members' : '/expenses')} 
              className="bg-teal-600 hover:bg-teal-700"
            >
              {members.length === 0 ? 'Go to Members Setup' : 'Go to Expense Entry'}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settlement Results - ExpenseFlow</title>
        <meta name="description" content="View balances and settlement plan for your group expenses." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settlement Results</h1>
            <p className="text-xl text-gray-600 mb-8">View balances and optimal payment plan</p>

            {/* Balances Section */}
            <Card className="rounded-xl shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-gray-900">Member Balances</CardTitle>
                <CardDescription>Net balance for each member (positive = owed to them, negative = they owe)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900">Member</TableHead>
                        <TableHead className="text-gray-900 text-right">Balance</TableHead>
                        <TableHead className="text-gray-900 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.map((balance, index) => (
                        <motion.tr
                          key={balance.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={
                            balance.balance > 0.01
                              ? 'bg-emerald-50'
                              : balance.balance < -0.01
                              ? 'bg-rose-50'
                              : 'bg-gray-50'
                          }
                        >
                          <TableCell className="font-medium text-gray-900">
                            {balance.name}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${
                            balance.balance > 0.01
                              ? 'text-emerald-600'
                              : balance.balance < -0.01
                              ? 'text-rose-600'
                              : 'text-gray-600'
                          }`}>
                            ₹{Math.abs(balance.balance).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {balance.balance > 0.01 ? (
                              <span className="inline-flex items-center text-emerald-600 font-medium">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                Gets back
                              </span>
                            ) : balance.balance < -0.01 ? (
                              <span className="inline-flex items-center text-rose-600 font-medium">
                                <TrendingDown className="w-4 h-4 mr-1" />
                                Owes
                              </span>
                            ) : (
                              <span className="text-gray-600 font-medium">Settled</span>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Plan Section */}
            <Card className="rounded-xl shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-gray-900">Minimal Settlement Plan</CardTitle>
                <CardDescription>
                  {settlements.length === 0 
                    ? 'All balances are settled!' 
                    : 'Follow these payments to settle all debts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settlements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-xl font-medium text-gray-900">All Settled!</p>
                    <p className="text-gray-600 mt-2">No payments needed - everyone is even.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settlements.map((settlement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="font-bold text-gray-900">{settlement.from}</span>
                          <ArrowRight className="w-5 h-5 text-teal-600" />
                          <span className="font-bold text-gray-900">{settlement.to}</span>
                        </div>
                        <span className="text-2xl font-bold text-teal-600">
                          ₹{settlement.amount.toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleResetAll}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
              
              <Button
                onClick={() => navigate('/expenses')}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Add More Expenses
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SettlementResultsPage;