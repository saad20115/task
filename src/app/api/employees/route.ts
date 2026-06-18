import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'فشل في جلب الموظفين' }, { status: 500 });
  }
}
