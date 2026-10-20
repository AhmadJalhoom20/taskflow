'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Alert, Typography, Select } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';
import Logo from '@/components/ui/Logo';

const { Title, Text } = Typography;

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Validation limits, default role selection, and styling presets.
const CONFIG = {
  minPasswordLength: 6,
  defaultRole: 'owner' as const,
} as const;

const ROLE_OPTIONS = [
  { value: 'owner', labelEn: 'Admin (Owner)', labelAr: 'مالك — Admin' },
  { value: 'member', labelEn: 'Engineer (Member)', labelAr: 'مهندس — Member' },
  { value: 'trainee', labelEn: 'Viewer (Trainee)', labelAr: 'متدرب — Viewer' },
] as const;

const STYLES = {
  container: 'flex items-center justify-center min-h-[82vh] px-4 py-10',
  card: 'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark rounded-xl p-3 sm:p-5',
  pageTitle: '!mb-1.5 !font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display',
  pageSubtitle: 'text-xs text-[#5A5348] dark:!text-[#B5AC9C]',
  inputBase:
    'rounded text-sm bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  primarySubmitButton:
    'tactile-btn font-bold !text-white dark:!text-[#1A1408] h-11 rounded text-sm !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] shadow-xs',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'member' | 'trainee';
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function formatRoleOptions(isArabic: boolean, t: (key: TranslationKey) => string) {
  return ROLE_OPTIONS.map((item) => ({
    value: item.value,
    label: isArabic
      ? `${item.value === 'owner' ? t('owner') : item.value === 'member' ? t('member') : 'متدرب'} — ${item.labelAr}`
      : `${item.value === 'owner' ? t('owner') : item.value === 'member' ? t('member') : 'Trainee'} — ${item.labelEn}`,
  }));
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
// (Sub-components can be extracted here as UI grows)

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [form] = Form.useForm();

  const isArabic = language === 'ar';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roleSelectOptions = formatRoleOptions(isArabic, t);

  // --- Handlers ---
  const handleFormSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await register(
        values.name.trim(),
        values.email.trim(),
        values.password,
        values.role || CONFIG.defaultRole
      );
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (isArabic
            ? 'فشل في إنشاء الحساب المؤسسي. يرجى المحاولة مجدداً.'
            : 'Failed to create enterprise account. Please try again.')
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={STYLES.container}>
      <div className="w-full max-w-md">
        <Card variant="outlined" className={STYLES.card}>
          {/* Header & Brand */}
          <div className="text-center mb-6 pt-2">
            <div className="flex justify-center mb-4">
              <Logo size="large" />
            </div>
            <Title level={3} className={STYLES.pageTitle}>
              {isArabic ? 'إنشاء حساب جديد' : 'Create Account'}
            </Title>
            <Text className={STYLES.pageSubtitle}>
              {isArabic
                ? 'أطلق مساحة عملك لإدارة المشاريع والمهام الهندسية بدقة ومرونة'
                : 'Initialize your workspace for engineering project and task coordination'}
            </Text>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <Alert
              title={errorMessage}
              type="error"
              showIcon
              role="alert"
              className="mb-5 text-xs rounded-md"
            />
          )}

          {/* Registration Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                form.submit();
              }
            }}
            requiredMark="optional"
            initialValues={{ role: CONFIG.defaultRole }}
            className="space-y-1"
          >
            <Form.Item
              name="name"
              label={
                <span className="text-xs font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: isArabic ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-[#5A5348] dark:text-[#B5AC9C] me-2" />}
                placeholder={isArabic ? 'مثال: محمد علي' : 'e.g. Alex Morgan'}
                size="large"
                autoComplete="name"
                className={STYLES.inputBase}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: isArabic
                    ? 'يرجى إدخال عنوان البريد الإلكتروني'
                    : 'Please enter your email address',
                },
                {
                  type: 'email',
                  message: isArabic
                    ? 'يرجى إدخال بريد إلكتروني صالح'
                    : 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-[#5A5348] dark:text-[#B5AC9C] me-2" />}
                placeholder="name@company.com"
                size="large"
                autoComplete="email"
                className={STYLES.inputBase}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-xs font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: isArabic
                    ? 'يرجى إدخال كلمة المرور'
                    : 'Please enter your account password',
                },
                {
                  min: CONFIG.minPasswordLength,
                  message: isArabic
                    ? 'يجب أن لا تقل كلمة المرور عن 6 أحرف'
                    : 'Password must be at least 6 characters long',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-[#5A5348] dark:text-[#B5AC9C] me-2" />}
                placeholder="••••••••••••"
                size="large"
                autoComplete="new-password"
                className={STYLES.inputBase}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span className="text-xs font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'الدور الوظيفي المبدئي' : 'Initial Workspace Role'}
                </span>
              }
            >
              <Select
                size="large"
                className={`w-full text-sm ${STYLES.inputBase}`}
                options={roleSelectOptions}
              />
            </Form.Item>

            <Form.Item className="!mb-4 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                iconPlacement="end"
                icon={<ArrowRightOutlined className="rtl:-scale-x-100" />}
                className={STYLES.primarySubmitButton}
              >
                {t('getStarted')}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#5A5348] dark:text-[#B5AC9C] pt-4 border-t border-[#DDDAD3] dark:border-[#2C2824]">
            {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link
              href="/login"
              className="text-[#7A5818] dark:text-[#D4B26E] font-semibold hover:underline"
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign in here'}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
