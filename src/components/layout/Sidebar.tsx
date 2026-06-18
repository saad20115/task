'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Box,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/lib/constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'المهام', icon: ListTodo },
  { href: '/dashboard/tasks/new', label: 'مهمة جديدة', icon: PlusCircle },
  { href: '/dashboard/gantt', label: 'جدول التنفيذ', icon: BarChart3 },
  { href: '/dashboard/admin', label: 'إدارة الحسابات', icon: Shield },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-screen bg-white border-l border-slate-100 shadow-soft z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
          <Box size={22} className="text-white" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-lg text-slate-900">TaskManagar</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">إدارة مهام أودو 17</p>
          </motion.div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon size={20} className={cn(isActive ? 'text-brand-600' : 'text-slate-400')} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-600"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      {user && (
        <div className="p-3 border-t border-slate-100">
          <div className={cn('flex items-center gap-3 p-2 rounded-xl', !isCollapsed && 'mb-1')}>
            <Avatar name={user.name} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-400">{USER_ROLE_LABELS[user.role]}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>تسجيل خروج</span>}
          </button>
        </div>
      )}
    </motion.aside>
  );
}
