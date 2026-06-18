import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tasks/:id/comments
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const comment = await prisma.comment.create({
      data: {
        taskId: params.id,
        authorId: body.author_id,
        content: body.content,
      },
      include: { author: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: params.id,
        actorId: body.author_id,
        action: 'إضافة تعليق',
        oldValue: '',
        newValue: body.content.substring(0, 50),
      },
    });

    const transformed = {
      ...comment,
      task_id: comment.taskId,
      author_id: comment.authorId,
      created_at: comment.createdAt.toISOString(),
      author: comment.author ? {
        ...comment.author,
        created_at: comment.author.createdAt.toISOString(),
        avatar_url: comment.author.avatarUrl,
      } : null,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'فشل في إضافة التعليق' }, { status: 500 });
  }
}
