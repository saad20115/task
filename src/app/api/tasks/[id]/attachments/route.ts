import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tasks/:id/attachments - Add link attachment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const attachment = await prisma.attachment.create({
      data: {
        taskId: params.id,
        fileName: body.file_name,
        fileUrl: body.file_url,
        fileType: body.file_type || 'link',
        fileSize: body.file_size || 0,
        uploadedBy: body.uploaded_by,
      },
      include: { uploader: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: params.id,
        actorId: body.uploaded_by,
        action: 'إضافة مرفق',
        oldValue: '',
        newValue: body.file_name,
      },
    });

    const transformed = {
      ...attachment,
      task_id: attachment.taskId,
      file_name: attachment.fileName,
      file_url: attachment.fileUrl,
      file_type: attachment.fileType,
      file_size: attachment.fileSize,
      uploaded_by: attachment.uploadedBy,
      created_at: attachment.createdAt.toISOString(),
      uploader: attachment.uploader ? {
        ...attachment.uploader,
        created_at: attachment.uploader.createdAt.toISOString(),
        avatar_url: attachment.uploader.avatarUrl,
      } : null,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error adding attachment:', error);
    return NextResponse.json({ error: 'فشل في إضافة المرفق' }, { status: 500 });
  }
}
