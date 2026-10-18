'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import Link from 'next/link';
import {
  FolderAddOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  CompassOutlined,
  BugOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Alert, Typography, Breadcrumb, Tag, Spin } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface TemplateOption {
  key: string;
  name: string;
  tag: string;
  badgeColor: string;
  icon: React.ReactNode;
  defaultName: string;
  defaultDesc: string;
}

const SUGGESTED_NAMES_EN = [
  'Platform Core 2026',
  'Design System & Tokens',
  'API Gateway & Auth',
  'Mobile Client Sprint',
  'Infrastructure Migration',
];

const SUGGESTED_NAMES_AR = [
  'المنصة الأساسية 2026',
  'نظام التصميم والتوكنز',
  'بوابة الـ API والمصادقة',
  'تطوير تطبيق الهاتف',
  'ترحيل البنية التحتية',
];

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [form] = Form.useForm();

  const isArabic = language === 'ar';

  const templates: TemplateOption[] = [
    {
      key: 'sprint',
      name: isArabic ? 'سبرنت هندسي برمجى' : 'Engineering Sprint',
      tag: isArabic ? 'أجايل وكانبان' : 'Agile & Kanban',
      badgeColor: 'blue',
      icon: <AppstoreOutlined className="text-blue-500 text-lg" />,
      defaultName: isArabic ? 'سبرنت المنصة الأساسية 2026' : 'Platform Core: Sprint 2026',
      defaultDesc: isArabic
        ? 'سبرنت هندسي برمجى يركز على استقرار الـ API الخلفية ومعالجة المهام الحرجة ومحطات الإطلاق.'
        : 'Core engineering sprint focusing on backend API stabilization, high-priority issues, and release milestones.',
    },
    {
      key: 'roadmap',
      name: isArabic ? 'خارطة طريق المنتج وتجربة المستخدم' : 'Product & UX Roadmap',
      tag: isArabic ? 'استكشاف ومواصفات' : 'Discovery & Specs',
      badgeColor: 'purple',
      icon: <CompassOutlined className="text-purple-500 text-lg" />,
      defaultName: isArabic ? 'خارطة طريق المنتج وتجربة المستخدم' : 'Product & UX Roadmap',
      defaultDesc: isArabic
        ? 'مبادرات الإطلاق الفصلية، مراجعة توكنز التصميم، وتوثيق آراء المستخدمين ومتطلبات السوق.'
        : 'Quarterly product initiatives, customer feedback loops, and design system tokens.',
    },
    {
      key: 'triage',
      name: isArabic ? 'إدارة البنية ومعالجة الأخطاء' : 'Architecture & Bug Triage',
      tag: isArabic ? 'الموثوقية والعمليات' : 'Reliability & Ops',
      badgeColor: 'emerald',
      icon: <BugOutlined className="text-emerald-500 text-lg" />,
      defaultName: isArabic ? 'إدارة البنية ومعالجة الأخطاء' : 'Architecture & Bug Triage',
      defaultDesc: isArabic
        ? 'تحسين أداء قواعد البيانات، عقود أخطاء RFC-9457، تدقيق الأمان وتتبع معايير SLA.'
        : 'Database performance optimizations, RFC-9457 error contracts, security audits, and regression tracking.',
    },
  ];

  const suggestedNames = isArabic ? SUGGESTED_NAMES_AR : SUGGESTED_NAMES_EN;

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateParam || null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (templateParam) {
      const match = templates.find((t) => t.key === templateParam);
      if (match) {
        setSelectedTemplate(match.key);
        form.setFieldsValue({
          name: match.defaultName,
          description: match.defaultDesc,
        });
      }
    }
  }, [templateParam, form, language]);

  const handleSelectTemplate = (template: TemplateOption) => {
    if (selectedTemplate === template.key) {
      setSelectedTemplate(null);
      form.setFieldsValue({ name: '', description: '' });
    } else {
      setSelectedTemplate(template.key);
      form.setFieldsValue({
        name: template.defaultName,
        description: template.defaultDesc,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setError(null);
    const trimmedName = values.name?.trim() || '';

    if (trimmedName.length < 3 || trimmedName.length > 80) {
      setError(
        isArabic
          ? 'يجب أن يكون اسم المشروع بين 3 و 80 حرفاً.'
          : 'Project name must be between 3 and 80 characters.'
      );
      return;
    }

    if (!user) return;

    try {
      setIsSubmitting(true);
      const newProj = await DataService.createProject(trimmedName, values.description || '', user);
      router.push(`/projects/${newProj.id}`);
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? 'فشل في إنشاء المشروع. يرجى المحاولة مجدداً.'
            : 'Failed to create project. Please try again.')
      );
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    form.setFieldsValue({ name });
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spin size="large" />
        <span className="text-xs text-slate-500 font-medium">
          {isArabic ? 'جاري التحقق من صلاحيات الحساب...' : 'Verifying workspace permissions...'}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { title: <Link href="/dashboard">{t('dashboard')}</Link> },
          { title: t('newProject') },
        ]}
      />

      {/* Template Quick Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('quickStartTemplates')}
          </span>
          {selectedTemplate && (
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(null);
                form.setFieldsValue({ name: '', description: '' });
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {t('clearTemplate')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.key;
            return (
              <div
                key={tmpl.key}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3.5 rounded-xl border text-start cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#161c26] border border-slate-200/80 dark:border-[#1e2430] flex items-center justify-center">
                    {tmpl.icon}
                  </div>
                  {isSelected && <CheckCircleFilled className="text-blue-600 text-sm" />}
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {tmpl.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {tmpl.defaultDesc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card
        variant="outlined"
        className="relative border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-sm rounded-xl overflow-hidden"
        title={
          <div className="flex items-center gap-3 py-1.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderAddOutlined className="text-base" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('initProjectWorkspace')}
              </div>
              <div className="text-xs font-normal text-slate-400 flex items-center gap-1.5">
                <CrownOutlined className="text-amber-500 text-[11px]" />
                <span>{t('ownerAuthorityGrant')}</span>
              </div>
            </div>
          </div>
        }
      >
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            className="mb-5 text-xs rounded-lg"
          />
        )}

        {/* Informative Governance Callout */}
        <div className="p-3.5 mb-6 rounded-lg bg-slate-50 dark:bg-[#161c26] border border-slate-200/80 dark:border-[#1e2430] flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <InfoCircleOutlined className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            {t('governanceCallout')}
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('projectNameLabel')}</span>}
            extra={
              <div className="space-y-2 mt-1.5">
                <span className="text-[11px] text-slate-400">{t('projectNameExtra')}</span>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-slate-400">{t('suggestions')}</span>
                  {suggestedNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSuggestionClick(name)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            }
            rules={[
              { required: true, message: isArabic ? 'يرجى إدخال اسم المشروع' : 'Please enter a project name' },
              { min: 3, message: isArabic ? 'الحد الأدنى 3 أحرف' : 'Minimum 3 characters required' },
              { max: 80, message: isArabic ? 'الحد الأقصى 80 حرفاً' : 'Maximum 80 characters allowed' },
            ]}
          >
            <Input
              showCount
              maxLength={80}
              placeholder={isArabic ? 'مثال: المنصة الأساسية 2026' : 'e.g. Platform Core 2026'}
              size="large"
              className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('objectivesScopeLabel')}</span>}
            extra={<span className="text-[11px] text-slate-400">{t('objectivesExtra')}</span>}
            rules={[{ max: 1000, message: isArabic ? 'لا يمكن أن يتجاوز الوصف 1000 حرف' : 'Description cannot exceed 1000 characters' }]}
          >
            <Input.TextArea
              showCount
              maxLength={1000}
              rows={4}
              placeholder={t('objectivesPlaceholder')}
              className="rounded-lg text-sm bg-slate-50/50 dark:bg-[#161b26] border-slate-200 dark:border-[#222938]"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1e2430]">
            <Link href="/dashboard">
              <Button className="border-slate-200 dark:border-[#1e2430] rounded-lg">{t('cancel')}</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="!bg-blue-600 hover:!bg-blue-500 !border-blue-600 text-white font-medium px-5 rounded-lg shadow-none"
            >
              {t('initWorkspaceBtn')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spin size="large" />
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
