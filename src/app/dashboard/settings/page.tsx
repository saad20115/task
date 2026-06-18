'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Building, Shield, Save, CheckCircle } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLE_LABELS } from '@/lib/constants';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/employees/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          department: formData.department,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      const data = await response.json();
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-slate-500 text-sm mt-1">إدارة حسابك الشخصي</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <Avatar name={user.name} size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield size={14} className="text-brand-500" />
                    <span className="text-sm text-brand-600 font-medium">{USER_ROLE_LABELS[user.role]}</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-5">
                <Input
                  label="الاسم"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<User size={18} />}
                  id="settings-name"
                />

                <Input
                  label="رقم الجوال"
                  value={formData.phone}
                  disabled
                  icon={<Phone size={18} />}
                  id="settings-phone"
                  dir="ltr"
                  className="bg-slate-50"
                />

                <Input
                  label="القسم"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  icon={<Building size={18} />}
                  placeholder="مثال: تقنية المعلومات"
                  id="settings-department"
                />

                <div className="pt-4 border-t border-slate-100">
                  <Button type="submit" isLoading={isSaving}>
                    {saved ? (
                      <>
                        <CheckCircle size={18} />
                        تم الحفظ
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3">معلومات النظام</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>الإصدار</span>
                  <span className="text-slate-700 font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>النظام</span>
                  <span className="text-slate-700 font-medium">TaskManagar - Odoo 17</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ التسجيل</span>
                  <span className="text-slate-700 font-medium" dir="ltr">{user.created_at ? new Date(user.created_at).toLocaleDateString('ar') : '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
