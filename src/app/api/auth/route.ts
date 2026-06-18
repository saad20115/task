import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth - Login or register
export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'الاسم ورقم الجوال مطلوبان' }, { status: 400 });
    }

    // Try to find existing employee
    let employee = await prisma.employee.findUnique({
      where: { phone },
    });

    if (employee && !employee.isActive) {
      return NextResponse.json({ error: 'حسابك معطّل. تواصل مع المدير' }, { status: 403 });
    }

    if (!employee) {
      // Create new employee
      employee = await prisma.employee.create({
        data: { name, phone, role: 'employee' },
      });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل الدخول' }, { status: 500 });
  }
}
