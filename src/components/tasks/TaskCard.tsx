'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Paperclip, Calendar, ChevronUp, ChevronDown, AlertTriangle, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import TaskStatusBadge from './TaskStatusBadge';
import PriorityBadge from './PriorityBadge';
import { Task } from '@/lib/types';
import { timeAgo, formatDate } from '@/lib/utils';
import { TASK_CATEGORY_LABELS } from '@/lib/constants';

interface TaskCardProps {
  task: Task;
  index?: number;
  showReorder?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function getDueDateStatus(dueDate: string | undefined): { label: string; color: string; bgColor: string; icon: React.ReactNode } | null {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `\u0645\u062a\u0623\u062e\u0631 ${Math.abs(diffDays)} \u064a\u0648\u0645`, color: 'text-red-700', bgColor: 'bg-red-50 border border-red-200', icon: <AlertTriangle size={12} className="text-red-500" /> };
  }
  if (diffDays === 0) {
    return { label: '\u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u064a\u0648\u0645!', color: 'text-orange-700', bgColor: 'bg-orange-50 border border-orange-200', icon: <AlertTriangle size={12} className="text-orange-500" /> };
  }
  if (diffDays <= 3) {
    return { label: `\u0628\u0627\u0642\u064a ${diffDays} \u0623\u064a\u0627\u0645`, color: 'text-amber-700', bgColor: 'bg-amber-50 border border-amber-200', icon: <Clock size={12} className="text-amber-500" /> };
  }
  if (diffDays <= 7) {
    return { label: `\u0628\u0627\u0642\u064a ${diffDays} \u0623\u064a\u0627\u0645`, color: 'text-blue-600', bgColor: 'bg-blue-50 border border-blue-200', icon: <Clock size={12} className="text-blue-400" /> };
  }
  return null;
}

export default function TaskCard({ task, index = 0, showReorder, isFirst, isLast, onMoveUp, onMoveDown }: TaskCardProps) {
  const router = useRouter();
  const dueDateStatus = task.status !== 'done' && task.status !== 'cancelled' ? getDueDateStatus(task.end_date) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-stretch gap-2"
    >
      {/* Reorder Buttons */}
      {showReorder && (
        <div className="flex flex-col justify-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
            disabled={isFirst}
            className={`p-1.5 rounded-lg transition-all ${isFirst ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}
            title="\u062a\u0642\u062f\u064a\u0645"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
            disabled={isLast}
            className={`p-1.5 rounded-lg transition-all ${isLast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}
            title="\u062a\u0623\u062e\u064a\u0631"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      <div className="flex-1">
        <Card hover onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
          <div className="p-5">
            {/* Due Date Alert */}
            {dueDateStatus && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-3 ${dueDateStatus.bgColor} ${dueDateStatus.color}`}>
                {dueDateStatus.icon}
                {dueDateStatus.label}
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate mb-1">{task.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{task.short_description}</p>
              </div>
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Category & Status */}
            <div className="flex items-center gap-2 mb-4">
              <TaskStatusBadge status={task.status} />
              {task.category && TASK_CATEGORY_LABELS[task.category] && (
                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                  {TASK_CATEGORY_LABELS[task.category].icon} {TASK_CATEGORY_LABELS[task.category].label}
                </span>
              )}
              {task.odoo_module && (
                <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-medium">
                  {task.odoo_module}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex items-center gap-3">
                {/* Creator */}
                {task.creator && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={task.creator.name} size="sm" />
                    <span className="text-xs text-slate-500">{task.creator.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                {/* Due date */}
                {task.end_date && (
                  <span className={`flex items-center gap-1 text-xs ${dueDateStatus ? dueDateStatus.color : ''}`}>
                    <Calendar size={12} />
                    {formatDate(task.end_date)}
                  </span>
                )}
                {/* Comments count */}
                {(task.comments_count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <MessageSquare size={12} />
                    {task.comments_count}
                  </span>
                )}
                {/* Attachments count */}
                {(task.attachments_count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <Paperclip size={12} />
                    {task.attachments_count}
                  </span>
                )}
                {/* Time ago */}
                <span className="text-xs">{timeAgo(task.created_at)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
