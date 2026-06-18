'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import PriorityBadge from '@/components/tasks/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getDashboardStats, getTasks, getRecentActivity } from '@/lib/supabase/database';
import { DashboardStats, Task, ActivityLog } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

const statCards = [
  { key: 'total_tasks', label: 'إجمالي المهام', icon: ListTodo, color: 'from-brand-500 to-brand-600', lightColor: 'bg-brand-50' },
  { key: 'in_progress_tasks', label: 'قيد العمل', icon: Clock, color: 'from-amber-500 to-orange-500', lightColor: 'bg-amber-50' },
  { key: 'completed_tasks', label: 'مكتملة', icon: CheckCircle2, color: 'from-emerald-500 to-green-500', lightColor: 'bg-emerald-50' },
  { key: 'critical_tasks', label: 'حرجة', icon: AlertTriangle, color: 'from-red-500 to-rose-500', lightColor: 'bg-red-50' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, tasksData, activityData] = await Promise.all([
          getDashboardStats(),
          getTasks(),
          getRecentActivity(),
        ]);
        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5));
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            مرحباً{user?.name ? `, ${user.name}` : ''} 👋
          </h1>
          <p className="text-slate-500 mt-1">إليك نظرة عامة على مهام التطوير</p>
        </div>
        <Button onClick={() => router.push('/dashboard/tasks/new')}>
          <Plus size={18} />
          مهمة جديدة
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const value = stats ? stats[stat.key as keyof DashboardStats] : 0;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900">{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-5 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-brand-600" />
                  <h2 className="font-semibold text-slate-900">آخر المهام</h2>
                </div>
                <button
                  onClick={() => router.push('/dashboard/tasks')}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowLeft size={14} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  لا توجد مهام بعد
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate text-sm">{task.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{task.short_description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <TaskStatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {task.creator && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={task.creator.name} size="sm" />
                          <span className="text-xs text-slate-400">{task.creator.name}</span>
                        </div>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(task.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="p-5 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                <h2 className="font-semibold text-slate-900">آخر النشاطات</h2>
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">لا توجد نشاطات بعد</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{(activity.actor as unknown as {name: string})?.name || 'مستخدم'}</span>
                        {' '}{activity.action}
                      </p>
                      {activity.new_value && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{activity.new_value}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
