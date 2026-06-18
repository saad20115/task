'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  UserCheck,
  UserX,
  Phone,
  Building,
  Calendar,
  ListTodo,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

interface AdminEmployee {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatar_url?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  tasks_count: number;
  assigned_tasks_count: number;
  comments_count: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<AdminEmployee | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (emp: AdminEmployee) => {
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, is_active: !emp.is_active }),
      });
      if (response.ok) {
        setEmployees(employees.map((e) =>
          e.id === emp.id ? { ...e, is_active: !emp.is_active } : e
        ));
      }
    } catch (error) {
      console.error('Failed to toggle access:', error);
    }
  };

  const changeRole = async (empId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: empId, role: newRole }),
      });
      if (response.ok) {
        setEmployees(employees.map((e) =>
          e.id === empId ? { ...e, role: newRole } : e
        ));
        setShowRoleModal(false);
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (search && !emp.name.includes(search) && !emp.phone.includes(search)) return false;
    if (filterRole !== 'all' && emp.role !== filterRole) return false;
    if (filterStatus === 'active' && !emp.is_active) return false;
    if (filterStatus === 'inactive' && emp.is_active) return false;
    return true;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.is_active).length,
    inactive: employees.filter((e) => !e.is_active).length,
    admins: employees.filter((e) => e.role === 'admin').length,
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldX size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{'\u063a\u064a\u0631 \u0645\u0635\u0631\u062d'}</h2>
        <p className="text-slate-500">{'\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u062a\u0627\u062d\u0629 \u0644\u0644\u0645\u062f\u064a\u0631\u064a\u0646 \u0641\u0642\u0637'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="text-brand-600" size={28} />
          {'\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a'}
        </h1>
        <p className="text-slate-500 mt-1">{'\u0625\u062f\u0627\u0631\u0629 \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0623\u062f\u0648\u0627\u0631 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646'}</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a', value: stats.total, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: '\u062d\u0633\u0627\u0628\u0627\u062a \u0646\u0634\u0637\u0629', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '\u062d\u0633\u0627\u0628\u0627\u062a \u0645\u0639\u0637\u0644\u0629', value: stats.inactive, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
          { label: '\u0645\u062f\u064a\u0631\u064a\u0646', value: stats.admins, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={'\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">{'\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062f\u0648\u0627\u0631'}</option>
                <option value="admin">{'\u0645\u062f\u064a\u0631'}</option>
                <option value="developer">{'\u0645\u0637\u0648\u0631'}</option>
                <option value="employee">{'\u0645\u0648\u0638\u0641'}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">{'\u0627\u0644\u0643\u0644'}</option>
                <option value="active">{'\u0646\u0634\u0637'}</option>
                <option value="inactive">{'\u0645\u0639\u0637\u0644'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Users size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{'\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c'}</p>
              </CardContent>
            </Card>
          ) : (
            filteredEmployees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <Card className={`transition-all duration-200 ${!emp.is_active ? 'opacity-60 bg-slate-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar name={emp.name} size="md" />
                        <div className={`absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${emp.is_active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{emp.name}</h3>
                          <Badge variant={emp.role === 'admin' ? 'info' : emp.role === 'developer' ? 'warning' : 'default'}>
                            {USER_ROLE_LABELS[emp.role] || emp.role}
                          </Badge>
                          {!emp.is_active && (
                            <Badge variant="danger">{'\u0645\u0639\u0637\u0644'}</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {emp.phone}
                          </span>
                          {emp.department && (
                            <span className="flex items-center gap-1">
                              <Building size={12} />
                              {emp.department}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {timeAgo(emp.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ListTodo size={12} />
                            {emp.tasks_count} {'\u0645\u0647\u0645\u0629'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {emp.comments_count} {'\u062a\u0639\u0644\u064a\u0642'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Change Role */}
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setShowRoleModal(true);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title={'\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062f\u0648\u0631'}
                        >
                          <ChevronDown size={18} />
                        </button>

                        {/* Toggle Access */}
                        {emp.id !== user?.id && (
                          <Button
                            variant={emp.is_active ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => toggleAccess(emp)}
                          >
                            {emp.is_active ? (
                              <><UserX size={16} className="ml-1" /> {'\u062a\u0639\u0637\u064a\u0644'}</>
                            ) : (
                              <><UserCheck size={16} className="ml-1" /> {'\u062a\u0641\u0639\u064a\u0644'}</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => { setShowRoleModal(false); setSelectedEmployee(null); }}
        title={'\u062a\u063a\u064a\u064a\u0631 \u062f\u0648\u0631 \u0627\u0644\u0645\u0648\u0638\u0641'}
      >
        {selectedEmployee && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              {'\u062a\u063a\u064a\u064a\u0631 \u062f\u0648\u0631'} <span className="font-semibold text-slate-900">{selectedEmployee.name}</span>
            </p>
            {['admin', 'developer', 'employee'].map((role) => (
              <button
                key={role}
                onClick={() => changeRole(selectedEmployee.id, role)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedEmployee.role === role
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Shield size={18} />
                <div className="text-right">
                  <p className="font-medium">{USER_ROLE_LABELS[role]}</p>
                  <p className="text-xs text-slate-400">
                    {role === 'admin' ? '\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0643\u0627\u0645\u0644\u0629 + \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a' :
                     role === 'developer' ? '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0647\u0627\u0645 + \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u0627\u0644\u0627\u062a' :
                     '\u0625\u0646\u0634\u0627\u0621 \u0645\u0647\u0627\u0645 + \u062a\u0639\u0644\u064a\u0642\u0627\u062a'}
                  </p>
                </div>
                {selectedEmployee.role === role && (
                  <ShieldCheck size={18} className="mr-auto text-brand-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
