import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function transformEmployee(emp: { id: string; name: string; phone: string; role: string; avatarUrl: string | null; department: string | null; createdAt: Date } | null) {
  if (!emp) return null;
  return { ...emp, created_at: emp.createdAt.toISOString(), avatar_url: emp.avatarUrl };
}

// GET /api/tasks/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        creator: true,
        assignee: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: { uploader: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    const transformed = {
      ...task,
      created_by: task.createdBy,
      assigned_to: task.assignedTo,
      short_description: task.shortDescription,
      odoo_module: task.odooModule,
      due_date: task.dueDate,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      creator: transformEmployee(task.creator),
      assignee: transformEmployee(task.assignee),
      comments: task.comments.map((c) => ({
        ...c,
        task_id: c.taskId,
        author_id: c.authorId,
        created_at: c.createdAt.toISOString(),
        author: transformEmployee(c.author),
      })),
      attachments: task.attachments.map((a) => ({
        ...a,
        task_id: a.taskId,
        file_name: a.fileName,
        file_url: a.fileUrl,
        file_type: a.fileType,
        file_size: a.fileSize,
        uploaded_by: a.uploadedBy,
        created_at: a.createdAt.toISOString(),
        uploader: transformEmployee(a.uploader),
      })),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'فشل في جلب المهمة' }, { status: 500 });
  }
}

// PUT /api/tasks/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const actorId = body.actor_id;

    // Get old task for activity log
    const oldTask = await prisma.task.findUnique({ where: { id: params.id } });

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.assigned_to !== undefined) updateData.assignedTo = body.assigned_to;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: true,
        assignee: true,
      },
    });

    // Log status change
    if (body.status && oldTask && oldTask.status !== body.status) {
      await prisma.activityLog.create({
        data: {
          taskId: params.id,
          actorId,
          action: 'تغيير الحالة',
          oldValue: oldTask.status,
          newValue: body.status,
        },
      });
    }

    // Log priority change
    if (body.priority && oldTask && oldTask.priority !== body.priority) {
      await prisma.activityLog.create({
        data: {
          taskId: params.id,
          actorId,
          action: 'تغيير الأولوية',
          oldValue: oldTask.priority,
          newValue: body.priority,
        },
      });
    }

    const transformed = {
      ...task,
      created_by: task.createdBy,
      assigned_to: task.assignedTo,
      short_description: task.shortDescription,
      odoo_module: task.odooModule,
      due_date: task.dueDate,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      creator: transformEmployee(task.creator),
      assignee: transformEmployee(task.assignee),
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'فشل في تحديث المهمة' }, { status: 500 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'فشل في حذف المهمة' }, { status: 500 });
  }
}
