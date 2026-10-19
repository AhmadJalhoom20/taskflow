'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setError(null);
    setLoading(true);

    try {
      await login(values.email.trim(), values.password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.message ||
          (language === 'ar'
            ? 'خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التحقق من صحة بياناتك.'
            : 'Invalid email or password combination. Please verify your credentials.')
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
              {t('signIn')}
            </Title>
            <Text className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'ar'
                ? 'أدخل بيانات الاعتماد المؤسسية للوصول إلى مساحة العمل الهندسية'
                : 'Enter your corporate credentials to access your engineering workspace'}
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
            className="space-y-1"
          >
            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'البريد الإلكتروني المؤسسي' : 'Corporate Email'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message:
                    language === 'ar'
                      ? 'يرجى إدخال عنوان البريد الإلكتروني'
                      : 'Please enter your corporate email address',
                },
                {
                  type: 'email',
                  message:
                    language === 'ar'
                      ? 'يرجى إدخال بريد إلكتروني صالح'
                      : 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400 me-2" />}
                placeholder="name@company.com"
                size="large"
                autoComplete="email"
                className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message:
                    language === 'ar'
                      ? 'يرجى إدخال كلمة المرور'
                      : 'Please enter your account password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 me-2" />}
                placeholder="••••••••••••"
                size="large"
                autoComplete="current-password"
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
                className="font-bold !text-slate-950 h-11 rounded-lg text-sm shadow-md shadow-amber-500/20 !bg-amber-500 hover:!bg-amber-400 !border-amber-500"
              >
                {t('signIn')}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-[#1b2336]">
            {language === 'ar' ? 'ليس لديك حساب مؤسسي؟ ' : "Don't have an enterprise account? "}
            <Link
              href="/register"
              className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              {language === 'ar' ? 'تسجيل مؤسسة جديدة' : 'Register your organization'}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
