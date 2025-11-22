'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Group, Expense } from '@/types';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { ExpenseList } from '@/components/expense-list';
import { BalanceView } from '@/components/balance-view';
import { ExpenseCharts } from '@/components/expense-charts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [groupResponse, expensesResponse] = await Promise.all([
        fetch(`/api/groups/${id}`),
        fetch(`/api/expenses?groupId=${id}`),
      ]);

      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        setGroup(groupData);
      } else {
        setGroup(null);
      }

      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: Expense) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;

    try {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Grupo no encontrado</h2>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const memberNames = new Map(group.members.map(m => [m.id, m.name]));
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-balance">{group.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Moneda base: {group.baseCurrency}
                </p>
              </div>
              <AddExpenseDialog group={group} onAddExpense={handleAddExpense} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Miembros</span>
                </div>
                <p className="text-2xl font-bold">{group.members.length}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total gastado</span>
                </div>
                <p className="text-2xl font-bold">
                  {totalExpenses.toFixed(2)} {group.baseCurrency}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="balance">Balances</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-6">
              <ExpenseList
                expenses={expenses}
                members={memberNames}
                baseCurrency={group.baseCurrency}
                onDeleteExpense={handleDeleteExpense}
              />
            </TabsContent>

            <TabsContent value="balance" className="mt-6">
              <BalanceView
                expenses={expenses}
                members={group.members}
                baseCurrency={group.baseCurrency}
              />
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <ExpenseCharts
                expenses={expenses}
                members={memberNames}
                baseCurrency={group.baseCurrency}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
