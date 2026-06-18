'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  User,
  Edit3,
  Archive,
  Paperclip,
  MessageSquare,
  Download,
  ExternalLink,
  Clock,
  Send,
  Image as ImageIcon,
  FileText,
  Activity,
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import PriorityBadge from '@/components/tasks/PriorityBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import {
  getTaskById,
  updateTask,
  addComment,
  getActivityLog,
  uploadFileWithUser,
} from '@/lib/supabase/database';
import { Task, Comment, ActivityLog, TaskStatus, TaskPriority } from '@/lib/types';
import { timeAgo, formatDate, formatDateTime, formatFileSize } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_CATEGORY_LABELS,
} from '@/lib/constants';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'activity'>('comments');

  const taskId = params.id as string;

  const loadTask = async () => {
    try {
      const [taskData, activityData] = await Promise.all([
        getTaskById(taskId),
        getActivityLog(taskId),
      ]);
      setTask(taskData);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task || !user) return;
    try {
      const updated = await updateTask(task.id, { status: newStatus as TaskStatus }, user.id);
      setTask({ ...task, ...updated });
      const activityData = await getActivityLog(taskId);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task || !user) return;
    try {
      const updated = await updateTask(task.id, { priority: newPriority as TaskPriority }, user.id);
      setTask({ ...task, ...updated });
      const activityData = await getActivityLog(taskId);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !task) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(task.id, user.id, commentText.trim());
      setTask({
        ...task,
        comments: [...(task.comments || []), newComment],
      });
      setCommentText('');
      const activityData = await getActivityLog(taskId);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length || !user || !task) return;

    for (const file of uploadedFiles) {
      try {
        const attachment = await uploadFileWithUser(file, task.id, user.id);
        setTask({
          ...task,
          attachments: [...(task.attachments || []), attachment],
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const handleArchive = async () => {
    if (!task || !user) return;
    try {
      await updateTask(task.id, { status: 'cancelled' as TaskStatus }, user.id);
      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-700">المهمة غير موجودة</h2>
        <Button onClick={() => router.push('/dashboard/tasks')} variant="outline" className="mt-4">
          العودة للمهام
        </Button>
      </div>
    );
  }

  const statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, info]) => ({
    value,
    label: info.label,
  }));

  const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, info]) => ({
    value,
    label: `${info.icon} ${info.label}`,
  }));

  return (
    <div>
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <button
          onClick={() => router.push('/dashboard/tasks')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowRight size={16} />
          العودة للمهام
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Task Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{task.title}</h1>
                  <p className="text-slate-500">{task.short_description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowArchiveModal(true)} className="text-amber-500 hover:text-amber-600 hover:bg-amber-50">
                  <Archive size={16} />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.category && TASK_CATEGORY_LABELS[task.category] && (
                  <Badge>
                    {TASK_CATEGORY_LABELS[task.category].icon} {TASK_CATEGORY_LABELS[task.category].label}
                  </Badge>
                )}
                {task.odoo_module && (
                  <Badge variant="purple">
                    📦 {task.odoo_module}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-slate max-w-none">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">الوصف التفصيلي</h3>
                <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {task.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <div className="border-b border-slate-100">
              <div className="flex">
                {[
                  { id: 'comments' as const, label: 'التعليقات', icon: MessageSquare, count: task.comments?.length || 0 },
                  { id: 'attachments' as const, label: 'المرفقات', icon: Paperclip, count: task.attachments?.length || 0 },
                  { id: 'activity' as const, label: 'سجل النشاط', icon: Activity, count: activities.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-5">
              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-5">
                  {/* Comment List */}
                  {task.comments && task.comments.length > 0 ? (
                    <div className="space-y-4">
                      {task.comments.map((comment: Comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar name={comment.author?.name || 'مستخدم'} size="sm" />
                          <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">{comment.author?.name}</span>
                              <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-6">لا توجد تعليقات بعد</p>
                  )}

                  {/* Add Comment */}
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <Avatar name={user?.name || ''} size="sm" />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="اكتب تعليقاً..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" isLoading={isSubmittingComment} disabled={!commentText.trim()}>
                          <Send size={14} />
                          إرسال
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {task.attachments && task.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {task.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg">
                            {att.file_type === 'link' ? '🔗' : att.file_type.startsWith('image/') ? <ImageIcon size={18} className="text-emerald-500" /> : <FileText size={18} className="text-slate-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{att.file_name}</p>
                            <p className="text-xs text-slate-400">
                              {att.file_type === 'link' ? 'رابط' : formatFileSize(att.file_size)}
                              {att.uploader && ` • ${att.uploader.name}`}
                            </p>
                          </div>
                          <a
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                          >
                            {att.file_type === 'link' ? <ExternalLink size={16} className="text-slate-400" /> : <Download size={16} className="text-slate-400" />}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-6">لا توجد مرفقات بعد</p>
                  )}

                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      id="detail-file-upload"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('detail-file-upload')?.click()}
                    >
                      <Paperclip size={14} />
                      إضافة مرفق
                    </Button>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((act) => (
                      <div key={act.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Clock size={14} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">{(act.actor as unknown as {name: string})?.name || 'مستخدم'}</span>
                            {' '}{act.action}
                          </p>
                          {act.old_value && act.new_value && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {TASK_STATUS_LABELS[act.old_value]?.label || act.old_value} → {TASK_STATUS_LABELS[act.new_value]?.label || act.new_value}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(act.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-6">لا توجد نشاطات بعد</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Status & Priority Control */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">إدارة المهمة</h3>

              <Select
                label="الحالة"
                options={statusOptions}
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                id="change-status"
              />

              <Select
                label="الأولوية"
                options={priorityOptions}
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                id="change-priority"
              />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">التفاصيل</h3>

              {/* Creator */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User size={14} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">أنشأها</p>
                  <p className="text-sm font-medium text-slate-700">{task.creator?.name || 'غير محدد'}</p>
                </div>
              </div>

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <User size={14} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">المطور المسؤول</p>
                    <p className="text-sm font-medium text-slate-700">{task.assignee.name}</p>
                  </div>
                </div>
              )}

              {/* Due Date */}
              {task.due_date && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Calendar size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">تاريخ التسليم</p>
                    <p className="text-sm font-medium text-slate-700" dir="ltr">{formatDate(task.due_date)}</p>
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Clock size={14} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">تاريخ الإنشاء</p>
                  <p className="text-sm font-medium text-slate-700">{formatDateTime(task.created_at)}</p>
                </div>
              </div>

              {/* Updated At */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Edit3 size={14} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">آخر تحديث</p>
                  <p className="text-sm font-medium text-slate-700">{timeAgo(task.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Archive Confirmation Modal */}
      <Modal isOpen={showArchiveModal} onClose={() => setShowArchiveModal(false)} title="أرشفة المهمة">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Archive size={20} className="text-amber-500" />
          </div>
          <p className="text-slate-700 mb-1">هل أنت متأكد من أرشفة هذه المهمة؟</p>
          <p className="text-sm text-slate-500 mb-6">سيتم تغيير حالة المهمة إلى ملغاة</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="danger" onClick={handleArchive}>
              نعم، أرشف
            </Button>
            <Button variant="ghost" onClick={() => setShowArchiveModal(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
