'use client';

import { useEffect, useState } from 'react';
import { Group } from '@/types';
import { GroupCard } from '@/components/group-card';
import { CreateGroupDialog } from '@/components/create-group-dialog';
import { Wallet } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }
    loadGroups(user.id);
  }, [authLoading, user]);

  const loadGroups = async (ownerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups?ownerId=${ownerId}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (group: Group) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(group),
      });
      
      if (response.ok && user) {
        await loadGroups(user.id);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo?')) return;
    
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok && user) {
        await loadGroups(user.id);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <header>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <CreateGroupDialog onCreateGroup={handleCreateGroup} />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No hay grupos todavía</h2>
              <p className="text-muted-foreground mb-6">Crea tu primer grupo para empezar a gestionar gastos</p>
              <CreateGroupDialog onCreateGroup={handleCreateGroup} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onDelete={handleDeleteGroup}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
