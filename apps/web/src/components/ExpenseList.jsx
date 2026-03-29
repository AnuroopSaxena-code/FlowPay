import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseClient';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
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
  
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date_desc'); // Firestore friendly sort key

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    if (currentGroupId) {
      fetchData();
    }
  }, [currentGroupId, refreshTrigger, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch members mapping
      const qMembers = query(collection(db, "members"), where("groupId", "==", currentGroupId));
      const snapMembers = await getDocs(qMembers);
      const memberMap = {};
      snapMembers.docs.forEach(doc => memberMap[doc.id] = doc.data().name);
      setMembers(memberMap);

      // 2. Determine Firestore sorting
      let field = "date";
      let direction = "desc";
      
      if (sortOrder === "date_asc") direction = "asc";
      if (sortOrder === "amount_desc") { field = "amount"; direction = "desc"; }
      if (sortOrder === "amount_asc") { field = "amount"; direction = "asc"; }

      const qExpenses = query(
        collection(db, "expenses"),
        where("groupId", "==", currentGroupId)
      );
      
      const snapExpenses = await getDocs(qExpenses);
      const records = snapExpenses.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // In-memory sorting replacements for Firestore orderBy
      records.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'date') {
          valA = new Date(valA || 0);
          valB = new Date(valB || 0);
        }
        
        if (direction === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      setExpenses(records);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRefresh = async () => {
    await fetchData();
    await fetchGroupData();
  };

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
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
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
                    <TableCell className="font-medium">
                      <div>{exp.description}</div>
                      {exp.creatorName && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Recorded by {exp.creatorName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}`}>
                        {exp.category || 'Other'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {exp.payers && exp.payers.length > 1 ? (
                        <span className="text-teal-600 dark:text-teal-400 font-medium">
                          {members[exp.payers[0].memberId] || 'Someone'} & {exp.payers.length - 1} {exp.payers.length === 2 ? 'other' : 'others'}
                        </span>
                      ) : (
                        members[exp.payerId] || 'Unknown'
                      )}
                    </TableCell>
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
          onDeleteSuccess={handleRefresh} 
        />
      </CardContent>
    </Card>
  );
};

export default ExpenseList;