'use client';

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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Props = {
  groupId: string;          
  initialGroup: Group;
  initialExpenses: Expense[];
};

export default function GroupPageClient({ groupId, initialGroup, initialExpenses }: Props) {
  const queryClient = useQueryClient();

  const {
    data: group,
    isLoading: groupLoading,
  } = useQuery<Group>({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error('Error cargando grupo');
      return res.json();
    },
    initialData: initialGroup,
  });

  const {
    data: expenses = [],
    isLoading: expensesLoading,
  } = useQuery<Expense[]>({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?groupId=${groupId}`);
      if (!res.ok) throw new Error('Error cargando gastos');
      return res.json();
    },
    initialData: initialExpenses,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) throw new Error('Error creando gasto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const res = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error eliminando gasto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    },
  });

  const handleAddExpense = (expense: Expense) => {
    addExpenseMutation.mutate(expense);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
    deleteExpenseMutation.mutate(expenseId);
  };

  const loading =
    groupLoading ||
    expensesLoading ||
    addExpenseMutation.isPending ||
    deleteExpenseMutation.isPending;

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

  const memberNames = new Map(group.members.map((m) => [m.id, m.name]));
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + e.amountInBaseCurrency,
    0
  );

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

            {loading && (
              <p className="mt-2 text-sm text-muted-foreground">
                Actualizando datos...
              </p>
            )}
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
