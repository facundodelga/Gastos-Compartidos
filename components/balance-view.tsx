'use client';

import { useMemo } from 'react';
import { Expense, Member } from '@/types';
import { calculateBalances, calculateSettlements } from '@/lib/balance-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { formatMoney } from '@/lib/format-number';

interface BalanceViewProps {
  expenses: Expense[];
  members: Member[];
  baseCurrency: string;
}

export function BalanceView({ expenses, members, baseCurrency }: BalanceViewProps) {
  const memberNames = useMemo(
    () => new Map(members.map(m => [m.id, m.name])),
    [members]
  );

  const balances = useMemo(
    () => calculateBalances(expenses, members.map(m => m.id), memberNames),
    [expenses, members, memberNames]
  );

  const settlements = useMemo(
    () => calculateSettlements(balances),
    [balances]
  );

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No hay gastos registrados. Agrega gastos para ver los balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balances.map((balance) => {
              const formattedBalance =
                balance.balance > 0.01
                  ? `+${formatMoney(balance.balance, baseCurrency)}`
                  : formatMoney(balance.balance, baseCurrency);

              return (
                <div key={balance.memberId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{balance.memberName}</span>
                    <span
                      className={`font-semibold ${
                        balance.balance > 0.01
                          ? 'text-green-600 dark:text-green-400'
                          : balance.balance < -0.01
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formattedBalance}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{formatMoney(balance.paid, baseCurrency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      <span>{formatMoney(balance.shouldPay, baseCurrency)}</span>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Liquidación simplificada</CardTitle>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium">¡Todo está equilibrado!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No hay pagos pendientes entre los miembros
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-medium">{settlement.fromName}</p>
                      <p className="text-xs text-muted-foreground">paga a</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="text-center">
                      <p className="font-medium">{settlement.toName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatMoney(settlement.amount, baseCurrency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}