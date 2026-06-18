import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/tasks/reorder - Reorder tasks (move up or down)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, direction } = body; // direction: 'up' or 'down'

    if (!taskId || !direction) {
      return NextResponse.json({ error: 'taskId and direction required' }, { status: 400 });
    }

    // Get the current task
    const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get all tasks ordered by sortOrder
    const allTasks = await prisma.task.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, sortOrder: true },
    });

    const currentIndex = allTasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Task not found in list' }, { status: 404 });
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= allTasks.length) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    const swapTask = allTasks[swapIndex];

    // Swap sort orders
    await prisma.$transaction([
      prisma.task.update({
        where: { id: taskId },
        data: { sortOrder: swapTask.sortOrder },
      }),
      prisma.task.update({
        where: { id: swapTask.id },
        data: { sortOrder: currentTask.sortOrder },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json({ error: 'فشل في إعادة الترتيب' }, { status: 500 });
  }
}
