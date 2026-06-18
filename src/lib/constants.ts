// ثوابت النظام - التسميات والألوان بالعربية

export const APP_NAME = 'TaskManagar';
export const APP_DESCRIPTION = 'نظام إدارة مهام تطوير أودو 17';

export const TASK_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: 'جديدة', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'قيد العمل', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  review: { label: 'مراجعة', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  testing: { label: 'اختبار', color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200' },
  done: { label: 'مكتملة', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'ملغاة', color: 'text-slate-500', bgColor: 'bg-slate-50 border-slate-200' },
};

export const TASK_PRIORITY_LABELS: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  critical: { label: 'حرجة', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: '🔴' },
  high: { label: 'عالية', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: '🟠' },
  medium: { label: 'متوسطة', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: '🟡' },
  low: { label: 'منخفضة', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: '🟢' },
};

export const TASK_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  module: { label: 'موديول', icon: '📦' },
  report: { label: 'تقرير', icon: '📊' },
  fix: { label: 'إصلاح خطأ', icon: '🔧' },
  feature: { label: 'ميزة جديدة', icon: '✨' },
  enhancement: { label: 'تحسين', icon: '⚡' },
  integration: { label: 'تكامل', icon: '🔗' },
  other: { label: 'أخرى', icon: '📋' },
};

export const USER_ROLE_LABELS: Record<string, string> = {
  employee: 'موظف',
  admin: 'مدير',
  developer: 'مطور',
};

export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
