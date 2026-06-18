'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
          )}
          {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 w-64">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell size={20} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          {user && (
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
              <Avatar name={user.name} size="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
