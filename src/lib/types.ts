// أنواع TypeScript الأساسية لنظام إدارة المهام

export type UserRole = 'employee' | 'admin' | 'developer';

export type TaskStatus = 'new' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskCategory = 'module' | 'report' | 'fix' | 'feature' | 'enhancement' | 'integration' | 'other';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  short_description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  odoo_module?: string;
  created_by: string;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
  // Joined fields
  creator?: Employee;
  assignee?: Employee;
  attachments?: Attachment[];
  comments?: Comment[];
  comments_count?: number;
  attachments_count?: number;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  uploader?: Employee;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Employee;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  actor_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  actor?: Employee;
}

export interface DashboardStats {
  total_tasks: number;
  new_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  critical_tasks: number;
}
