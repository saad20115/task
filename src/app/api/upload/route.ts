import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('task_id') as string;
    const uploadedBy = formData.get('uploaded_by') as string;

    if (!file || !taskId || !uploadedBy) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', taskId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const fileUrl = `/uploads/${taskId}/${uniqueName}`;
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileName: file.name,
        fileUrl,
        fileType: file.type || 'other',
        fileSize: file.size,
        uploadedBy,
      },
      include: { uploader: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId,
        actorId: uploadedBy,
        action: 'إضافة مرفق',
        oldValue: '',
        newValue: file.name,
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
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'فشل في رفع الملف' }, { status: 500 });
  }
}
