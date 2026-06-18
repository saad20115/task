import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/:id/activity
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { taskId: params.id },
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = activities.map((a) => ({
      ...a,
      task_id: a.taskId,
      actor_id: a.actorId,
      old_value: a.oldValue,
      new_value: a.newValue,
      created_at: a.createdAt.toISOString(),
      actor: a.actor ? {
        ...a.actor,
        created_at: a.actor.createdAt.toISOString(),
        avatar_url: a.actor.avatarUrl,
      } : null,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'فشل في جلب النشاطات' }, { status: 500 });
  }
}
