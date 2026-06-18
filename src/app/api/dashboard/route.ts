import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard
export async function GET() {
  try {
    const [total, newTasks, inProgress, review, testing, done, critical] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'new' } }),
      prisma.task.count({ where: { status: 'in_progress' } }),
      prisma.task.count({ where: { status: 'review' } }),
      prisma.task.count({ where: { status: 'testing' } }),
      prisma.task.count({ where: { status: 'done' } }),
      prisma.task.count({ where: { priority: 'critical' } }),
    ]);

    const recentActivity = await prisma.activityLog.findMany({
      include: {
        actor: true,
        task: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const transformedActivity = recentActivity.map((a) => ({
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

    return NextResponse.json({
      stats: {
        total_tasks: total,
        new_tasks: newTasks,
        in_progress_tasks: inProgress + review + testing,
        completed_tasks: done,
        critical_tasks: critical,
      },
      recent_activity: transformedActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات لوحة التحكم' }, { status: 500 });
  }
}
