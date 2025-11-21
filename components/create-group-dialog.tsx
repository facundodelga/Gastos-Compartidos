'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { Group, Member } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { validateGroupFieldsAction } from '@/app/actions/form-validations';

interface CreateGroupDialogProps {
  onCreateGroup: (group: Group) => void;
}

const CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'ARS', name: 'Peso argentino' },
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'CLP', name: 'Peso chileno' },
];

export function CreateGroupDialog({ onCreateGroup }: CreateGroupDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddMember = () => {
    const trimmedName = newMemberName.trim();
    if (!trimmedName) return;
    if (trimmedName.length > 30) {
      setFormError('Los nombres de los miembros no pueden superar 30 caracteres');
      return;
    }
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: trimmedName,
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setFormError('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const trimmedName = groupName.trim();
    const validation = await validateGroupFieldsAction({
      name: trimmedName,
      members,
    });

    if (!validation.success) {
      setFormError(validation.error);
      return;
    }

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: trimmedName,
      baseCurrency,
      members,
      createdAt: new Date().toISOString(),
      ownerId: user.id,
    };
    onCreateGroup(newGroup);
    setOpen(false);
    setGroupName('');
    setBaseCurrency('USD');
    setMembers([]);
    setFormError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Crear grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <Label htmlFor="group-name">Nombre del grupo</Label>
            <Input
              id="group-name"
              placeholder="Ej: Viaje a la playa"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moneda base</Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Miembros (mínimo 2)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del miembro"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                maxLength={30}
              />
              <Button type="button" onClick={handleAddMember} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {members.length > 0 && (
              <div className="space-y-2 mt-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-muted px-3 py-2 rounded-md"
                  >
                    <span>{member.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!user || !groupName.trim() || members.length < 2}
            className="w-full"
          >
            Crear grupo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
