import React from 'react';
import { TASK_PRIORITY_LABELS } from '@/lib/constants';
import { TaskPriority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityInfo = TASK_PRIORITY_LABELS[priority];
  if (!priorityInfo) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border',
        priorityInfo.bgColor,
        priorityInfo.color,
        className
      )}
    >
      <span>{priorityInfo.icon}</span>
      {priorityInfo.label}
    </span>
  );
}
