import { NextResponse } from 'next/server';
import { getAllGroups, saveGroup } from '@/lib/database';
import { groupCreationSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const groups = getAllGroups();
    const filteredGroups = ownerId ? groups.filter(group => group.ownerId === ownerId) : groups;
    return NextResponse.json(filteredGroups);
  } catch (error) {
    console.error('Error reading groups:', error);
    return NextResponse.json({ error: 'Failed to read groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const group = await request.json();
    const parsed = groupCreationSchema.safeParse(group);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Datos del grupo inválidos' },
        { status: 400 }
      );
    }

    saveGroup(parsed.data);
    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('Error saving group:', error);
    return NextResponse.json({ error: 'Failed to save group' }, { status: 500 });
  }
}
