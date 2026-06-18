'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import TaskCard from '@/components/tasks/TaskCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getTasks } from '@/lib/supabase/database';
import { Task, TaskStatus } from '@/lib/types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, PRIORITY_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('manual');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const handleReorder = async (taskId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/tasks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, direction }),
      });
      if (response.ok) {
        // Reload tasks
        const data = await getTasks();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.short_description.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort
    switch (sortBy) {
      case 'manual':
        result.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'priority':
        result.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
        break;
      case 'due_date':
        result.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
    }

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Kanban columns
  const kanbanColumns: { status: TaskStatus; label: string }[] = [
    { status: 'new', label: 'جديدة' },
    { status: 'in_progress', label: 'قيد العمل' },
    { status: 'review', label: 'مراجعة' },
    { status: 'testing', label: 'اختبار' },
    { status: 'done', label: 'مكتملة' },
  ];

  const statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, info]) => ({
    value,
    label: info.label,
  }));

  const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, info]) => ({
    value,
    label: `${info.icon} ${info.label}`,
  }));

  const sortOptions = [
    { value: 'manual', label: 'ترتيب يدوي' },
    { value: 'newest', label: 'الأحدث أولاً' },
    { value: 'oldest', label: 'الأقدم أولاً' },
    { value: 'priority', label: 'الأولوية' },
    { value: 'due_date', label: 'موعد التسليم' },
    { value: 'title', label: 'العنوان' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filteredAndSortedTasks.length} مهمة</p>
        </div>
        <Button onClick={() => router.push('/dashboard/tasks/new')}>
          <Plus size={18} />
          مهمة جديدة
        </Button>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في المهام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="الحالة"
              className="w-36"
            />
            <Select
              options={priorityOptions}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              placeholder="الأولوية"
              className="w-36"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'kanban' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      {filteredAndSortedTasks.length === 0 ? (
        <EmptyState
          title="لا توجد مهام"
          description="لم يتم العثور على مهام مطابقة. جرب تغيير الفلاتر أو أنشئ مهمة جديدة."
          action={
            <Button onClick={() => router.push('/dashboard/tasks/new')}>
              <Plus size={18} />
              إنشاء مهمة
            </Button>
          }
        />
      ) : viewMode === 'list' ? (
        <div className={sortBy === 'manual' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {filteredAndSortedTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              showReorder={sortBy === 'manual'}
              isFirst={index === 0}
              isLast={index === filteredAndSortedTasks.length - 1}
              onMoveUp={() => handleReorder(task.id, 'up')}
              onMoveDown={() => handleReorder(task.id, 'down')}
            />
          ))}
        </div>
      ) : (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((column) => {
            const columnTasks = filteredAndSortedTasks.filter((t) => t.status === column.status);
            return (
              <div key={column.status} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <h3 className="font-semibold text-slate-700 text-sm">{column.label}</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-sm text-slate-400">
                      لا توجد مهام
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
