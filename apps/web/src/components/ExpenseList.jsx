import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2, Search, Filter, Calendar } from 'lucide-react';
import DeleteExpenseDialog from './DeleteExpenseDialog';

const CATEGORY_COLORS = {
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Accommodation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  Utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const ExpenseList = ({ onEdit, refreshTrigger }) => {
  const { currentGroupId, fetchGroupData } = useGroup();
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('-date');

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    if (currentGroupId) {
      fetchData();
    }
  }, [currentGroupId, refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch members for mapping IDs to names
      const membersData = await pb.collection('members').getFullList({
        filter: `groupId = "${currentGroupId}"`,
        $autoCancel: false
      });
      const memberMap = {};
      membersData.forEach(m => memberMap[m.id] = m.name);
      setMembers(memberMap);

      // Fetch expenses
      const records = await pb.collection('expenses').getFullList({
        filter: `groupId = "${currentGroupId}"`,
        sort: sortOrder,
        $autoCancel: false
      });
      setExpenses(records);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when sort changes
  useEffect(() => {
    if (currentGroupId && !loading) fetchData();
  }, [sortOrder]);

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (exp.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!currentGroupId) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search expenses..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(CATEGORY_COLORS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-date">Newest First</SelectItem>
                <SelectItem value="date">Oldest First</SelectItem>
                <SelectItem value="-amount">Highest Amount</SelectItem>
                <SelectItem value="amount">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading expenses...</TableCell></TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expenses found.</TableCell></TableRow>
              ) : (
                filteredExpenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {exp.date ? new Date(exp.date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{exp.description}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}`}>
                        {exp.category || 'Other'}
                      </span>
                    </TableCell>
                    <TableCell>{members[exp.payerId] || 'Unknown'}</TableCell>
                    <TableCell className="text-right font-bold">₹{exp.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(exp)} className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(exp)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DeleteExpenseDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen} 
          expense={expenseToDelete} 
          onDeleteSuccess={fetchData} 
        />
      </CardContent>
    </Card>
  );
};

export default ExpenseList;