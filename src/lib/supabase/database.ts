// طبقة خدمة البيانات - تستدعي API Routes المحلية بدلاً من Supabase مباشرة

import { Employee, Task, Comment, Attachment, ActivityLog, DashboardStats, TaskStatus, TaskPriority } from '../types';

const API_BASE = '';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'خطأ غير معروف' }));
    throw new Error(error.error || 'حدث خطأ في الخادم');
  }

  return response.json();
}

// ========== Employees ==========

export async function loginEmployee(name: string, phone: string): Promise<Employee> {
  return fetchAPI<Employee>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });
}

export async function getEmployees(): Promise<Employee[]> {
  return fetchAPI<Employee[]>('/api/employees');
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  try {
    return await fetchAPI<Employee>(`/api/employees/${id}`);
  } catch {
    return null;
  }
}

// ========== Tasks ==========

export async function getTasks(filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  created_by?: string;
  assigned_to?: string;
  search?: string;
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.created_by) params.set('created_by', filters.created_by);
  if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to);
  if (filters?.search) params.set('search', filters.search);

  const query = params.toString();
  return fetchAPI<Task[]>(`/api/tasks${query ? `?${query}` : ''}`);
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    return await fetchAPI<Task>(`/api/tasks/${id}`);
  } catch {
    return null;
  }
}

export async function createTask(task: {
  title: string;
  description: string;
  short_description: string;
  priority: TaskPriority;
  category: string;
  odoo_module?: string;
  created_by: string;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Task> {
  return fetchAPI<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateTask(id: string, updates: Partial<Task>, actorId: string): Promise<Task> {
  return fetchAPI<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...updates, actor_id: actorId }),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await fetchAPI(`/api/tasks/${id}`, { method: 'DELETE' });
}

// ========== Comments ==========

export async function getComments(taskId: string): Promise<Comment[]> {
  const task = await getTaskById(taskId);
  return task?.comments || [];
}

export async function addComment(taskId: string, authorId: string, content: string): Promise<Comment> {
  return fetchAPI<Comment>(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ author_id: authorId, content }),
  });
}

// ========== Attachments ==========

export async function addAttachment(attachment: {
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
}): Promise<Attachment> {
  return fetchAPI<Attachment>(`/api/tasks/${attachment.task_id}/attachments`, {
    method: 'POST',
    body: JSON.stringify(attachment),
  });
}

export async function uploadFile(file: File, taskId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task_id', taskId);
  formData.append('uploaded_by', '');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('فشل في رفع الملف');
  }

  const data = await response.json();
  return data.file_url;
}

export async function uploadFileWithUser(file: File, taskId: string, userId: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task_id', taskId);
  formData.append('uploaded_by', userId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('فشل في رفع الملف');
  }

  return response.json();
}

export async function deleteAttachment(id: string): Promise<void> {
  await fetchAPI(`/api/attachments/${id}`, { method: 'DELETE' });
}

// ========== Activity Log ==========

export async function getActivityLog(taskId: string): Promise<ActivityLog[]> {
  return fetchAPI<ActivityLog[]>(`/api/tasks/${taskId}/activity`);
}

// ========== Dashboard ==========

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await fetchAPI<{ stats: DashboardStats }>('/api/dashboard');
  return data.stats;
}

export async function getRecentActivity(): Promise<ActivityLog[]> {
  const data = await fetchAPI<{ recent_activity: ActivityLog[] }>('/api/dashboard');
  return data.recent_activity;
}
