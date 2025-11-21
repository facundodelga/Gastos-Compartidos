'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { Group, Expense } from '@/types';
import { convertCurrency } from '@/lib/exchange-rate';
import { validateExpenseAction } from '@/app/actions/form-validations';

interface AddExpenseDialogProps {
  group: Group;
  onAddExpense: (expense: Expense) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'ARS', symbol: '$' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'MXN', symbol: '$' },
  { code: 'CLP', symbol: '$' },
];

const CATEGORIES = [
  'Comida',
  'Transporte',
  'Alojamiento',
  'Entretenimiento',
  'Compras',
  'Servicios',
  'Otros',
];

export function AddExpenseDialog({ group, onAddExpense }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(group.baseCurrency);
  const [paidBy, setPaidBy] = useState(group.members[0]?.id || '');
  const [participants, setParticipants] = useState<string[]>(
    group.members.map(m => m.id)
  );
  const [category, setCategory] = useState('Otros');
  const [formError, setFormError] = useState('');

  const handleToggleParticipant = (memberId: string) => {
    setParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!description.trim() || !amount || participants.length === 0) return;

    setFormError('');
    const validation = await validateExpenseAction({
      description: description.trim(),
      amount,
    });

    if (!validation.success) {
      setFormError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      const amountInBaseCurrency = await convertCurrency(
        amountNum,
        currency,
        group.baseCurrency
      );

      const newExpense: Expense = {
        id: crypto.randomUUID(),
        groupId: group.id,
        description: description.trim(),
        amount: amountNum,
        currency,
        amountInBaseCurrency,
        paidBy,
        participants,
        category,
        date: new Date().toISOString(),
      };

      onAddExpense(newExpense);
      setOpen(false);
      setDescription('');
      setAmount('');
      setCurrency(group.baseCurrency);
      setPaidBy(group.members[0]?.id || '');
      setParticipants(group.members.map(m => m.id));
      setCategory('Otros');
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Error al crear el gasto. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar nuevo gasto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Cena en restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Pagado por</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger id="paidBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member.id}
                    checked={participants.includes(member.id)}
                    onCheckedChange={() => handleToggleParticipant(member.id)}
                  />
                  <label
                    htmlFor={member.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!description.trim() || !amount || participants.length === 0 || loading}
            className="w-full"
          >
            {loading ? 'Procesando...' : 'Agregar gasto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
