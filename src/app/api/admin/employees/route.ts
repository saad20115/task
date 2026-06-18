import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/employees - Get all employees with full details
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
            assignedTasks: true,
            comments: true,
          },
        },
      },
    });

    const transformed = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      phone: emp.phone,
      role: emp.role,
      avatar_url: emp.avatarUrl,
      department: emp.department,
      is_active: emp.isActive,
      created_at: emp.createdAt.toISOString(),
      tasks_count: emp._count.tasks,
      assigned_tasks_count: emp._count.assignedTasks,
      comments_count: emp._count.comments,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: '\u0641\u0634\u0644 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646' }, { status: 500 });
  }
}

// PUT /api/admin/employees - Update employee status/role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active, role } = body;

    if (!id) {
      return NextResponse.json({ error: '\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0648\u0638\u0641 \u0645\u0637\u0644\u0648\u0628' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (is_active !== undefined) updateData.isActive = is_active;
    if (role !== undefined) updateData.role = role;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      avatar_url: employee.avatarUrl,
      department: employee.department,
      is_active: employee.isActive,
      created_at: employee.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: '\u0641\u0634\u0644 \u0641\u064a \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0648\u0638\u0641' }, { status: 500 });
  }
}

// DELETE /api/admin/employees - Delete employee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0648\u0638\u0641 \u0645\u0637\u0644\u0648\u0628' }, { status: 400 });
    }

    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: '\u0641\u0634\u0644 \u0641\u064a \u062d\u0630\u0641 \u0627\u0644\u0645\u0648\u0638\u0641' }, { status: 500 });
  }
}
