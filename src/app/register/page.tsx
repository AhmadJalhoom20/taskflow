'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Alert, Typography, Select } from 'antd';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setError(null);
    setLoading(true);
    try {
      await register(
        values.name.trim(),
        values.email.trim(),
        values.password,
        values.role || 'member'
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'ar'
            ? 'فشل في إنشاء الحساب المؤسسي. يرجى المحاولة مجدداً.'
            : 'Failed to create enterprise account. Please try again.')
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[82vh] px-4 py-10">
      <div className="w-full max-w-md">
        <Card
          variant="outlined"
          className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-sm rounded-xl p-2 sm:p-4"
        >
          <div className="text-center mb-7 pt-2">
            <div className="flex justify-center mb-4">
              <Logo size="large" />
            </div>
            <Title level={3} className="!mb-1.5 !font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {language === 'ar' ? 'إنشاء حساب مؤسسي' : 'Create Enterprise Account'}
            </Title>
            <Text className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'ar'
                ? 'أطلق مساحة عملك لإدارة المشاريع والمهام الهندسية بدقة ومرونة'
                : 'Launch your workspace for engineering project and task management'}
            </Text>
          </div>

          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              role="alert"
              className="mb-5 text-xs rounded-lg"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark="optional"
            initialValues={{ role: 'owner' }}
            className="space-y-1"
          >
            <Form.Item
              name="name"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 me-2" />}
                placeholder="Sarah Connor"
                size="large"
                autoComplete="name"
                className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'البريد الإلكتروني المؤسسي' : 'Corporate Email Address'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your corporate email',
                },
                {
                  type: 'email',
                  message: language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 me-2" />}
                placeholder="sarah@company.com"
                size="large"
                autoComplete="email"
                className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'نوع الحساب الأولي' : 'Initial Account Role'}
                </span>
              }
              rules={[{ required: true, message: language === 'ar' ? 'يرجى اختيار نوع الحساب' : 'Please select an account role' }]}
            >
              <Select
                size="large"
                className="rounded-lg text-sm"
                options={[
                  {
                    value: 'owner',
                    label: language === 'ar' ? 'مالك مساحة العمل (تحكم كامل)' : 'Workspace Owner (Full control)',
                  },
                  {
                    value: 'member',
                    label: language === 'ar' ? 'قائد هندسي (تنفيذ المهام وتحديث الحالة)' : 'Engineering Lead (Execute and update)',
                  },
                  {
                    value: 'trainee',
                    label: language === 'ar' ? 'متدرب برمجي (متابعة المهام المسندة)' : 'Software Trainee (View assigned items)',
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'كلمة المرور (8 أحرف على الأقل)' : 'Account Password (min 8 characters)'}
                </span>
              }
              rules={[
                { required: true, message: language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter a secure password' },
                { min: 8, message: language === 'ar' ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 me-2" />}
                placeholder="At least 8 characters"
                size="large"
                autoComplete="new-password"
                className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
              />
            </Form.Item>

            <Form.Item className="!mb-4 pt-3">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                iconPlacement="end"
                icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                className="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 font-bold !text-slate-950 h-11 rounded-lg text-sm shadow-md shadow-amber-500/20"
              >
                {language === 'ar' ? 'إنشاء حساب مساحة العمل' : 'Create Workspace Account'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-[#1b2336]">
            {language === 'ar' ? 'لديك حساب مسجل بالفعل؟ ' : 'Already have an enterprise account? '}
            <Link
              href="/login"
              className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              {language === 'ar' ? 'تسجيل الدخول هنا' : 'Sign In here'}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
