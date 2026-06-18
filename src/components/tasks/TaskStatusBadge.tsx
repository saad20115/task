import React from 'react';
import { TASK_STATUS_LABELS } from '@/lib/constants';
import { TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export default function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusInfo = TASK_STATUS_LABELS[status];
  if (!statusInfo) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border',
        statusInfo.bgColor,
        statusInfo.color,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      {statusInfo.label}
    </span>
  );
}
