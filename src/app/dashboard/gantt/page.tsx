'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Avatar from '@/components/ui/Avatar';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import PriorityBadge from '@/components/tasks/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { getTasks } from '@/lib/supabase/database';
import { Task } from '@/lib/types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants';

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
  const dates: Date[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('ar-SA', { day: 'numeric' });
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
}

function getDayName(d: Date): string {
  return d.toLocaleDateString('ar-SA', { weekday: 'short' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-400';
    case 'in_progress': return 'bg-amber-400';
    case 'review': return 'bg-purple-400';
    case 'testing': return 'bg-cyan-400';
    case 'done': return 'bg-emerald-400';
    case 'cancelled': return 'bg-slate-300';
    default: return 'bg-brand-400';
  }
}

function getStatusBgLight(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-50 border-blue-200';
    case 'in_progress': return 'bg-amber-50 border-amber-200';
    case 'review': return 'bg-purple-50 border-purple-200';
    case 'testing': return 'bg-cyan-50 border-cyan-200';
    case 'done': return 'bg-emerald-50 border-emerald-200';
    case 'cancelled': return 'bg-slate-50 border-slate-200';
    default: return 'bg-brand-50 border-brand-200';
  }
}

export default function GanttPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.status !== 'cancelled');
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter) result = result.filter((t) => t.priority === priorityFilter);
    // Sort by created_at
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return result;
  }, [tasks, statusFilter, priorityFilter]);

  const statusOptions = Object.entries(TASK_STATUS_LABELS)
    .filter(([key]) => key !== 'cancelled')
    .map(([value, info]) => ({ value, label: info.label }));

  const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, info]) => ({
    value, label: `${info.icon} ${info.label}`,
  }));

  // Group dates by month for header
  const monthGroups = useMemo(() => {
    const groups: { month: string; count: number }[] = [];
    let currentMonth = '';
    for (const d of dates) {
      const m = formatMonthYear(d);
      if (m !== currentMonth) {
        groups.push({ month: m, count: 1 });
        currentMonth = m;
      } else {
        groups[groups.length - 1].count++;
      }
    }
    return groups;
  }, [dates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-brand-600" size={28} />
            جدول تنفيذ المهام
          </h1>
          <p className="text-slate-500 text-sm mt-1">عرض المهام على جدول زمني - Gantt Chart</p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </motion.div>

      {/* Timeline Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-600" />
                <span className="font-semibold text-slate-900">
                  {startDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                  {' - '}
                  {endDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  اليوم
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="overflow-x-auto">
              <div style={{ minWidth: '900px' }}>
                {/* Month Headers */}
                <div className="flex">
                  <div className="w-64 flex-shrink-0" />
                  {monthGroups.map((mg, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-semibold text-slate-500 border-b border-slate-100 pb-1"
                      style={{ width: `${(mg.count / dates.length) * 100}%` }}
                    >
                      {mg.month}
                    </div>
                  ))}
                </div>

                {/* Day Headers */}
                <div className="flex border-b border-slate-200">
                  <div className="w-64 flex-shrink-0 p-2 text-xs font-semibold text-slate-500 border-l border-slate-200">
                    المهمة
                  </div>
                  {dates.map((d, i) => (
                    <div
                      key={i}
                      className={`flex-1 text-center py-2 text-[10px] border-l border-slate-100 ${
                        isToday(d) ? 'bg-brand-50 font-bold text-brand-700' :
                        d.getDay() === 5 || d.getDay() === 6 ? 'bg-slate-50 text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <div className="font-medium">{getDayName(d)}</div>
                      <div>{formatShortDate(d)}</div>
                    </div>
                  ))}
                </div>

                {/* Task Rows */}
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    لا توجد مهام لعرضها
                  </div>
                ) : (
                  filteredTasks.map((task, idx) => {
                    const created = task.start_date ? new Date(task.start_date) : new Date(task.created_at);
                    const due = task.end_date ? new Date(task.end_date) : null;

                    return (
                      <div
                        key={task.id}
                        className={`flex border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-25'}`}
                        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      >
                        {/* Task Info */}
                        <div className="w-64 flex-shrink-0 p-3 border-l border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <PriorityBadge priority={task.priority} />
                            <h4 className="text-sm font-medium text-slate-900 truncate flex-1">{task.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <TaskStatusBadge status={task.status} />
                            {task.creator && (
                              <div className="flex items-center gap-1">
                                <Avatar name={task.creator.name} size="sm" />
                                <span className="text-[10px] text-slate-400 truncate">{task.creator.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline Cells */}
                        <div className="flex flex-1 relative">
                          {dates.map((d, i) => {
                            const dayStart = new Date(d);
                            dayStart.setHours(0, 0, 0, 0);

                            const createdDay = new Date(created);
                            createdDay.setHours(0, 0, 0, 0);

                            const isCreatedDay = isSameDay(d, createdDay);
                            const isDueDay = due && isSameDay(d, due);

                            // Check if day is between created and due
                            let isInRange = false;
                            if (due) {
                              const dueDay = new Date(due);
                              dueDay.setHours(0, 0, 0, 0);
                              isInRange = dayStart >= createdDay && dayStart <= dueDay;
                            }

                            const isWeekend = d.getDay() === 5 || d.getDay() === 6;

                            return (
                              <div
                                key={i}
                                className={`flex-1 h-16 border-l border-slate-100 relative ${
                                  isToday(d) ? 'bg-brand-50/30' : isWeekend ? 'bg-slate-50/50' : ''
                                }`}
                              >
                                {isInRange && (
                                  <div
                                    className={`absolute top-1/2 -translate-y-1/2 h-6 ${getStatusColor(task.status)} opacity-80 rounded-sm ${
                                      isCreatedDay ? 'right-0 rounded-r-full' : 'right-0'
                                    } ${
                                      isDueDay ? 'left-0 rounded-l-full' : 'left-0'
                                    }`}
                                    style={{
                                      right: isCreatedDay ? '2px' : '0',
                                      left: isDueDay ? '2px' : '0',
                                    }}
                                  />
                                )}
                                {isCreatedDay && !isInRange && (
                                  <div className={`absolute top-1/2 -translate-y-1/2 right-1 left-1 h-6 ${getStatusColor(task.status)} opacity-80 rounded-full`} />
                                )}
                                {isDueDay && (
                                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" title="موعد التسليم" />
                                )}
                                {isToday(d) && (
                                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-brand-500 opacity-40" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">دليل الألوان:</span>
              {Object.entries(TASK_STATUS_LABELS)
                .filter(([key]) => key !== 'cancelled')
                .map(([key, info]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${getStatusColor(key)}`} />
                    <span className="text-xs text-slate-500">{info.label}</span>
                  </div>
                ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-slate-500">موعد تسليم</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-0.5 h-3 bg-brand-500" />
                <span className="text-xs text-slate-500">اليوم</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
