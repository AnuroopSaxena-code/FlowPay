import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Loader2, TrendingUp, Users, Receipt, CreditCard } from 'lucide-react';

const COLORS = ['#0d9488', '#f97316', '#3b82f6', '#ec4899', '#eab308', '#a855f7', '#64748b'];

const AnalyticsDashboard = () => {
  const { currentGroupId } = useGroup();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    avgExpense: 0,
    topCategory: '',
    expenseCount: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [payerData, setPayerData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    if (currentGroupId) fetchAnalytics();
  }, [currentGroupId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [members, expenses] = await Promise.all([
        pb.collection('members').getFullList({ filter: `groupId = "${currentGroupId}"`, $autoCancel: false }),
        pb.collection('expenses').getFullList({ filter: `groupId = "${currentGroupId}"`, sort: 'date', $autoCancel: false })
      ]);

      const memberMap = {};
      members.forEach(m => memberMap[m.id] = m.name);

      let total = 0;
      const catMap = {};
      const payMap = {};
      const timeMap = {};

      expenses.forEach(exp => {
        const amt = parseFloat(exp.amount);
        total += amt;

        // Category
        const cat = exp.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + amt;

        // Payer
        const payerName = memberMap[exp.payerId] || 'Unknown';
        payMap[payerName] = (payMap[payerName] || 0) + amt;

        // Timeline
        if (exp.date) {
          const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: '2-digit' });
          timeMap[month] = (timeMap[month] || 0) + amt;
        }
      });

      // Format for Recharts
      const cData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      const pData = Object.entries(payMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
      const tData = Object.entries(timeMap).map(([date, amount]) => ({ date, amount }));

      setCategoryData(cData);
      setPayerData(pData);
      setTimelineData(tData);

      setStats({
        totalSpent: total,
        avgExpense: expenses.length ? total / expenses.length : 0,
        topCategory: cData.length ? cData[0].name : 'N/A',
        expenseCount: expenses.length
      });

    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentGroupId) return null;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  if (stats.expenseCount === 0) {
    return <div className="text-center py-16 text-muted-foreground border rounded-xl bg-muted/10">No expenses recorded yet to show analytics.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Group Spend</p>
            <h3 className="text-2xl font-bold">₹{stats.totalSpent.toFixed(0)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Avg. Expense</p>
            <h3 className="text-2xl font-bold">₹{stats.avgExpense.toFixed(0)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Top Category</p>
            <h3 className="text-xl font-bold truncate w-full">{stats.topCategory}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold">{stats.expenseCount}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payer Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Who Paid What</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payerData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `₹${val}`} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline Chart */}
        {timelineData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Spending Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;