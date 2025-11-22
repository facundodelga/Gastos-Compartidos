'use client';

import { Expense } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatMoney } from '@/lib/format-number';

interface ExpenseListProps {
  expenses: Expense[];
  members: Map<string, string>;
  baseCurrency: string;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, members, baseCurrency, onDeleteExpense }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay gastos registrados todavía</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-balance">{expense.description}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="text-destructive hover:text-destructive -mr-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatMoney(expense.amount, expense.currency)}
                  {expense.currency !== baseCurrency && (
                    <span className="ml-1">
                      (≈ {formatMoney(expense.amountInBaseCurrency, baseCurrency)})
                    </span>
                  )}
                </span>
                <span>Pagó: {members.get(expense.paidBy)}</span>
                <span>Categoría: {expense.category}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(expense.date), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Participantes: </span>
                <span>{expense.participants.map(id => members.get(id)).join(', ')}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}