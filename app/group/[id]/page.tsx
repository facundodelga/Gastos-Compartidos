import { notFound } from 'next/navigation';
import type { Group, Expense } from '@/types';
import GroupPageClient from './GroupPageClient';
import { getExpensesByGroupId, getGroupById } from '@/lib/database';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params;
  
  const group = getGroupById(id);
   const expenses = getExpensesByGroupId(id);

  if (!group || !expenses) {
    // 404 SSR
    notFound();
  }

  /*const group: Group = await groupResponse.json();
  const expenses: Expense[] = expensesResponse.ok
    ? await expensesResponse.json()
    : [];
*/
  return (
    <GroupPageClient
      groupId={id}
      initialGroup={group}
      initialExpenses={expenses}
    />
  );
}
