'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Send, User, Phone, Building, Info, Lightbulb } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import FileUpload from '@/components/ui/FileUpload';
import Card, { CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { createTask, uploadFileWithUser, addAttachment, getEmployees } from '@/lib/supabase/database';
import { Employee, TaskPriority } from '@/lib/types';
import { TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS, USER_ROLE_LABELS } from '@/lib/constants';

export default function NewTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<{ url: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    priority: 'medium',
    category: 'other',
    odoo_module: '',
    assigned_to: '',
    due_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getEmployees().then(setEmployees).catch(console.error);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'عنوان المهمة مطلوب';
    if (!formData.short_description.trim()) newErrors.short_description = 'الوصف المختصر مطلوب';
    if (!formData.description.trim()) newErrors.description = 'الوصف التفصيلي مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsSubmitting(true);
    try {
      const task = await createTask({
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        priority: formData.priority as TaskPriority,
        category: formData.category,
        odoo_module: formData.odoo_module || undefined,
        created_by: user.id,
        assigned_to: formData.assigned_to || undefined,
        due_date: formData.due_date || undefined,
      });

      // Upload files
      for (const file of files) {
        await uploadFileWithUser(file, task.id, user.id);
      }

      // Add links as attachments
      for (const link of links) {
        await addAttachment({
          task_id: task.id,
          file_name: link.name,
          file_url: link.url,
          file_type: 'link',
          file_size: 0,
          uploaded_by: user.id,
        });
      }

      router.push(`/dashboard/tasks/${task.id}`);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, info]) => ({
    value,
    label: `${info.icon} ${info.label}`,
  }));

  const categoryOptions = Object.entries(TASK_CATEGORY_LABELS).map(([value, info]) => ({
    value,
    label: `${info.icon} ${info.label}`,
  }));

  const employeeOptions = employees
    .filter((e) => e.role === 'developer' || e.role === 'admin')
    .map((e) => ({ value: e.id, label: e.name }));

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
        >
          <ArrowRight size={16} />
          رجوع
        </button>
        <h1 className="text-2xl font-bold text-slate-900">إنشاء مهمة جديدة</h1>
        <p className="text-slate-500 text-sm mt-1">أضف متطلبات التطوير الجديدة</p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Right Side (2/3) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <Input
                  label="عنوان المهمة *"
                  placeholder="مثال: تعديل تقرير المبيعات الشهري"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                  id="task-title"
                />

                {/* Short Description */}
                <Input
                  label="وصف مختصر *"
                  placeholder="وصف موجز للمهمة في سطر واحد"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  error={errors.short_description}
                  id="task-short-desc"
                />

                {/* Full Description */}
                <Textarea
                  label="الوصف التفصيلي *"
                  placeholder="اشرح المتطلبات بالتفصيل: ما المطلوب؟ ما المشكلة الحالية؟ ما النتيجة المتوقعة؟"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={errors.description}
                  rows={6}
                  id="task-description"
                />

                {/* Row: Priority + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="الأولوية"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    id="task-priority"
                  />
                  <Select
                    label="التصنيف"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    id="task-category"
                  />
                </div>

                {/* Row: Odoo Module + Assigned To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="موديول أودو"
                    placeholder="مثال: sale, purchase, account"
                    value={formData.odoo_module}
                    onChange={(e) => setFormData({ ...formData, odoo_module: e.target.value })}
                    id="task-odoo-module"
                    dir="ltr"
                  />
                  <Select
                    label="تعيين إلى (مطور)"
                    options={employeeOptions}
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="اختر المطور"
                    id="task-assignee"
                  />
                </div>

                {/* Due Date */}
                <Input
                  label="تاريخ التسليم المتوقع"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  id="task-due-date"
                  dir="ltr"
                />

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">المرفقات</label>
                  <FileUpload
                    onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
                    onLinkAdded={(url, name) => setLinks([...links, { url, name }])}
                    selectedFiles={files}
                    onRemoveFile={(index) => setFiles(files.filter((_, i) => i !== index))}
                  />
                  {links.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {links.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                          <span className="text-blue-600">🔗</span>
                          <span className="text-blue-700 font-medium">{link.name}</span>
                          <span className="text-blue-500 text-xs truncate" dir="ltr">{link.url}</span>
                          <button
                            type="button"
                            onClick={() => setLinks(links.filter((_, j) => j !== i))}
                            className="mr-auto text-blue-400 hover:text-red-500 text-xs"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button type="submit" size="lg" isLoading={isSubmitting}>
                    <Send size={18} />
                    إنشاء المهمة
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => router.back()}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Left Side (1/3) */}
        <motion.div
          className="lg:col-span-1 space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Creator Info */}
          {user && (
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User size={16} className="text-brand-600" />
                  معلومات المنشئ
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{USER_ROLE_LABELS[user.role] || user.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Phone size={16} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">رقم الجوال</p>
                      <p className="text-sm font-medium text-slate-700" dir="ltr">{user.phone}</p>
                    </div>
                  </div>
                  {user.department && (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                      <Building size={16} className="text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400">القسم</p>
                        <p className="text-sm font-medium text-slate-700">{user.department}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info size={12} />
                    سيتم تسجيل بياناتك كمنشئ لهذه المهمة
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                نصائح لإنشاء مهمة فعّالة
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <span>اكتب عنواناً واضحاً يصف المطلوب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <span>اشرح المشكلة الحالية والنتيجة المتوقعة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <span>أرفق صور أو ملفات توضيحية إن وجدت</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <span>حدد الأولوية بدقة لترتيب العمل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <span>اذكر اسم الموديول في أودو إن كان معروفاً</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
