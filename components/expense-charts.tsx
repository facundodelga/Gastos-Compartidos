'use client';

import { useMemo } from 'react';
import { Expense } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseChartsProps {
  expenses: Expense[];
  members: Map<string, string>;
  baseCurrency: string;
}

/*const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];*/
const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#ec4899", // Pink
  "#84cc16", // Lime
];

export function ExpenseCharts({ expenses, members, baseCurrency }: ExpenseChartsProps) {
  const expensesByPerson = useMemo(() => {
    const data = new Map<string, number>();
    
    expenses.forEach(expense => {
      const name = members.get(expense.paidBy) || expense.paidBy;
      data.set(name, (data.get(name) || 0) + expense.amountInBaseCurrency);
    });

    return Array.from(data.entries())
      .map(([name, total]) => ({
        name,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total)
      .map((entry, index) => ({
        ...entry,
        fill: COLORS[index % COLORS.length],
      }));
  }, [expenses, members]);

  const expensesByCategory = useMemo(() => {
    const data = new Map<string, number>();
    
    expenses.forEach(expense => {
      data.set(
        expense.category,
        (data.get(expense.category) || 0) + expense.amountInBaseCurrency
      );
    });

    return Array.from(data.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No hay gastos registrados. Agrega gastos para ver los gráficos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gastos por persona */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por persona</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByPerson}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(2)} ${baseCurrency}`}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {expensesByPerson.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gastos por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(2)} ${baseCurrency}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de gastos por persona */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Detalle de gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Persona</th>
                  <th className="text-right py-3 px-4 font-medium">Total pagado</th>
                  <th className="text-right py-3 px-4 font-medium">Nº de gastos</th>
                  <th className="text-right py-3 px-4 font-medium">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {expensesByPerson.map((person, index) => {
                  const count = expenses.filter(
                    e => members.get(e.paidBy) === person.name
                  ).length;
                  const average = person.total / count;

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">{person.name}</td>
                      <td className="text-right py-3 px-4 font-medium">
                        {person.total.toFixed(2)} {baseCurrency}
                      </td>
                      <td className="text-right py-3 px-4">{count}</td>
                      <td className="text-right py-3 px-4">
                        {average.toFixed(2)} {baseCurrency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-muted">
                  <td className="py-3 px-4">Total</td>
                  <td className="text-right py-3 px-4">
                    {expensesByPerson.reduce((sum, p) => sum + p.total, 0).toFixed(2)} {baseCurrency}
                  </td>
                  <td className="text-right py-3 px-4">{expenses.length}</td>
                  <td className="text-right py-3 px-4">
                    {(expensesByPerson.reduce((sum, p) => sum + p.total, 0) / expenses.length).toFixed(2)} {baseCurrency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
