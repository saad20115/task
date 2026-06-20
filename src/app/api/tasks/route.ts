import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const createdBy = searchParams.get('created_by');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (createdBy) where.createdBy = createdBy;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend expectations
    const transformed = tasks.map((task) => ({
      ...task,
      created_by: task.createdBy,
      assigned_to: task.assignedTo,
      short_description: task.shortDescription,
      odoo_module: task.odooModule,
      start_date: task.startDate,
      end_date: task.endDate,
      sort_order: task.sortOrder,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      comments_count: task._count.comments,
      attachments_count: task._count.attachments,
      creator: task.creator ? { ...task.creator, created_at: task.creator.createdAt.toISOString(), avatar_url: task.creator.avatarUrl } : null,
      assignee: task.assignee ? { ...task.assignee, created_at: task.assignee.createdAt.toISOString(), avatar_url: task.assignee.avatarUrl } : null,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'فشل في جلب المهام' }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || '',
        shortDescription: body.short_description || '',
        priority: body.priority || 'medium',
        category: body.category || 'other',
        odooModule: body.odoo_module,
        createdBy: body.created_by,
        assignedTo: body.assigned_to || null,
        startDate: body.start_date || null,
        endDate: body.end_date || null,
      },
      include: {
        creator: true,
        assignee: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        actorId: body.created_by,
        action: 'إنشاء مهمة',
        oldValue: '',
        newValue: task.title,
      },
    });

    const transformed = {
      ...task,
      created_by: task.createdBy,
      assigned_to: task.assignedTo,
      short_description: task.shortDescription,
      odoo_module: task.odooModule,
      start_date: task.startDate,
      end_date: task.endDate,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      creator: task.creator ? { ...task.creator, created_at: task.creator.createdAt.toISOString(), avatar_url: task.creator.avatarUrl } : null,
      assignee: task.assignee ? { ...task.assignee, created_at: task.assignee.createdAt.toISOString(), avatar_url: task.assignee.avatarUrl } : null,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المهمة' }, { status: 500 });
  }
}
