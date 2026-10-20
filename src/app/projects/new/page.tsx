'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderAddOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  AppstoreOutlined,
  CompassOutlined,
  BugOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { Card, Form, Input, Button, Alert, Typography, Breadcrumb, Spin } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';

const { Title, Text } = Typography;

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Tweak project creation presets, suggested names, validation limits, and styles here.
const CONFIG = {
  maxNameLength: 80,
  minNameLength: 3,
  maxDescLength: 1000,
  defaultTemplateKey: null as string | null,
} as const;

const SUGGESTED_NAMES_MAP = {
  en: [
    'Platform Core 2026',
    'Design System & Tokens',
    'API Gateway & Auth',
    'Mobile Client Sprint',
    'Infrastructure Migration',
  ],
  ar: [
    'المنصة الأساسية 2026',
    'نظام التصميم والتوكنز',
    'بوابة الـ API والمصادقة',
    'تطوير تطبيق الهاتف',
    'ترحيل البنية التحتية',
  ],
} as const;

const TEMPLATES_MAP = {
  en: [
    {
      key: 'sprint',
      name: 'Engineering Sprint',
      tag: 'Agile & Kanban',
      iconType: 'appstore' as const,
      defaultName: 'Platform Core: Sprint 2026',
      defaultDesc:
        'Core engineering sprint focusing on backend API stabilization, high-priority issues, and release milestones.',
    },
    {
      key: 'roadmap',
      name: 'Product & UX Roadmap',
      tag: 'Discovery & Specs',
      iconType: 'compass' as const,
      defaultName: 'Product & UX Roadmap',
      defaultDesc:
        'Quarterly product initiatives, customer feedback loops, and design system tokens.',
    },
    {
      key: 'triage',
      name: 'Architecture & Bug Triage',
      tag: 'Reliability & Ops',
      iconType: 'bug' as const,
      defaultName: 'Architecture & Bug Triage',
      defaultDesc:
        'Database performance optimizations, RFC-9457 error contracts, security audits, and regression tracking.',
    },
  ],
  ar: [
    {
      key: 'sprint',
      name: 'سبرنت هندسي برمجى',
      tag: 'أجايل وكانبان',
      iconType: 'appstore' as const,
      defaultName: 'سبرنت المنصة الأساسية 2026',
      defaultDesc:
        'سبرنت هندسي برمجى يركز على استقرار الـ API الخلفية ومعالجة المهام الحرجة ومحطات الإطلاق.',
    },
    {
      key: 'roadmap',
      name: 'خارطة طريق ومواصفات',
      tag: 'استكشاف ومواصفات',
      iconType: 'compass' as const,
      defaultName: 'خارطة طريق المنتج وتجربة المستخدم',
      defaultDesc:
        'مبادرات الإطلاق الفصلية، مراجعة توكنز التصميم، وتوثيق آراء المستخدمين ومتطلبات السوق.',
    },
    {
      key: 'triage',
      name: 'إدارة البنية ومعالجة الأخطاء',
      tag: 'الموثوقية والعمليات',
      iconType: 'bug' as const,
      defaultName: 'إدارة البنية ومعالجة الأخطاء',
      defaultDesc:
        'تحسين أداء قواعد البيانات، عقود أخطاء RFC-9457، تدقيق الأمان وتتبع معايير SLA.',
    },
  ],
} as const;

const STYLES = {
  container: 'max-w-4xl mx-auto space-y-6 py-4',
  headerIconBox:
    'w-10 h-10 rounded-lg bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 border border-[#7A5818]/25 dark:border-[#D4B26E]/25 flex items-center justify-center text-[#7A5818] dark:text-[#D4B26E]',
  pageTitle:
    '!mb-0 !text-2xl !font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display',
  pageSubtitle: 'text-sm !text-[#5A5348] dark:!text-[#B5AC9C]',
  sectionHeading:
    'text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD] uppercase tracking-wider',
  card: 'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  inputBase:
    'rounded text-sm bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  suggestedChip:
    'tactile-btn text-xs sm:text-sm font-mono px-2.5 py-1 rounded bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] hover:border-[#7A5818] dark:hover:border-[#D4B26E] hover:text-[#7A5818] dark:hover:text-[#D4B26E] transition-colors cursor-pointer',
  templateActive:
    'border-[#7A5818] dark:border-[#D4B26E] bg-[#7A5818]/[0.05] dark:bg-[#D4B26E]/10 ring-1 ring-[#7A5818] dark:ring-[#D4B26E] shadow-xs',
  templateInactive:
    'border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] hover:border-[#7A5818]/40 dark:hover:border-[#D4B26E]/40',
  primarySubmitButton:
    'tactile-btn font-bold !text-white dark:!text-[#1A1408] !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] rounded px-6 shadow-xs',
  secondaryButton:
    'tactile-btn border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] font-semibold rounded',
  ownerBanner:
    'p-3 rounded-lg bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] flex items-center justify-between text-sm',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
type TemplateIconType = 'appstore' | 'compass' | 'bug';

interface TemplateItem {
  key: string;
  name: string;
  tag: string;
  iconType: TemplateIconType;
  defaultName: string;
  defaultDesc: string;
}

interface ProjectFormValues {
  name: string;
  description?: string;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function renderTemplateIcon(iconType: TemplateIconType) {
  const iconClass = 'text-[#7A5818] dark:text-[#D4B26E] text-lg';
  switch (iconType) {
    case 'compass':
      return <CompassOutlined className={iconClass} />;
    case 'bug':
      return <BugOutlined className={iconClass} />;
    case 'appstore':
    default:
      return <AppstoreOutlined className={iconClass} />;
  }
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
interface TemplateCardProps {
  template: TemplateItem;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <div
      onClick={() => onSelect(template.key)}
      className={`tactile-card rounded-lg p-3.5 border cursor-pointer flex flex-col justify-between transition-all select-none ${
        isSelected ? STYLES.templateActive : STYLES.templateInactive
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-md bg-[#EDECE8] dark:bg-[#1C1A17] flex items-center justify-center">
            {renderTemplateIcon(template.iconType)}
          </div>
          {isSelected ? (
            <CheckCircleFilled className="text-[#7A5818] dark:text-[#D4B26E] text-sm" />
          ) : (
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] border border-[#DDDAD3] dark:border-[#2C2824]">
              {template.tag}
            </span>
          )}
        </div>
        <div>
          <h4 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display">
            {template.name}
          </h4>
          <p className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] line-clamp-2 mt-1 leading-relaxed">
            {template.defaultDesc}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SuggestedNamesBarProps {
  names: readonly string[];
  isArabic: boolean;
  onApplyName: (name: string) => void;
}

function SuggestedNamesBar({ names, isArabic, onApplyName }: SuggestedNamesBarProps) {
  return (
    <div className="mb-2">
      <span className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] block mb-1.5 font-medium">
        {isArabic ? 'اقتراحات سريعة لاسم المشروع:' : 'Quick name suggestions:'}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onApplyName(name)}
            className={STYLES.suggestedChip}
          >
            + {name}
          </button>
        ))}
      </div>
    </div>
  );
}

interface OwnerAuthorityBannerProps {
  ownerName?: string;
  isArabic: boolean;
}

function OwnerAuthorityBanner({ ownerName, isArabic }: OwnerAuthorityBannerProps) {
  return (
    <div className={STYLES.ownerBanner}>
      <div className="flex items-center gap-2">
        <CrownOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
        <span className="text-[#5A5348] dark:text-[#B5AC9C] font-medium">
          {isArabic ? 'مالك المشروع المسجل:' : 'Project Owner Authority:'}
        </span>
        <strong className="text-[#1B1915] dark:text-[#EFE9DD]">{ownerName || '—'}</strong>
      </div>
      <span className="font-mono text-xs uppercase font-bold text-[#7A5818] dark:text-[#D4B26E] bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 px-2 py-0.5 rounded border border-[#7A5818]/25 dark:border-[#D4B26E]/25">
        OWNER RBAC
      </span>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams ? searchParams.get('template') : null;

  const { user, loading: authLoading } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [form] = Form.useForm();

  const isArabic = language === 'ar';

  // --- Derived Configuration based on current language ---
  const templates = useMemo<readonly TemplateItem[]>(() => {
    return isArabic ? TEMPLATES_MAP.ar : TEMPLATES_MAP.en;
  }, [isArabic]);

  const suggestedNames = useMemo<readonly string[]>(() => {
    return isArabic ? SUGGESTED_NAMES_MAP.ar : SUGGESTED_NAMES_MAP.en;
  }, [isArabic]);

  // --- Form State ---
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateParam || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Authentication Protection Guard ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // --- Sync Selected Template into Form Fields ---
  useEffect(() => {
    if (selectedTemplate) {
      const matched = templates.find((tpl) => tpl.key === selectedTemplate);
      if (matched) {
        form.setFieldsValue({
          name: matched.defaultName,
          description: matched.defaultDesc,
        });
      }
    }
  }, [selectedTemplate, templates, form]);

  // --- Event Handlers ---
  const handleSelectTemplate = (templateKey: string) => {
    if (selectedTemplate === templateKey) {
      setSelectedTemplate(null);
      form.setFieldsValue({ name: '', description: '' });
    } else {
      setSelectedTemplate(templateKey);
    }
  };

  const handleApplySuggestedName = (name: string) => {
    form.setFieldsValue({ name });
  };

  const handleFormSubmit = async (values: ProjectFormValues) => {
    if (!user || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const created = await DataService.createProject(
        values.name.trim(),
        values.description?.trim() || '',
        user
      );
      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isArabic ? 'فشل إنشاء المشروع' : 'Failed to create project')
      );
      setIsSubmitting(false);
    }
  };

  // --- Flat Guard Clauses ---
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={STYLES.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { title: <Link href="/dashboard">{t('dashboard')}</Link> },
          { title: t('newProject') },
        ]}
      />

      {/* Header Banner */}
      <div className="flex items-center gap-2.5">
        <div className={STYLES.headerIconBox}>
          <FolderAddOutlined className="text-xl" />
        </div>
        <div>
          <Title level={2} className={STYLES.pageTitle}>
            {t('newProject')}
          </Title>
          <Text type="secondary" className={STYLES.pageSubtitle}>
            {isArabic
              ? 'أنشئ مساحة عمل هندسية جديدة لتنسيق السبرنت وتوزيع المهام'
              : 'Initialize a new engineering project workspace with pure SQL durability'}
          </Text>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          title={errorMessage}
          type="error"
          showIcon
          role="alert"
          className="text-sm rounded-md"
        />
      )}

      {/* Template Selection Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={STYLES.sectionHeading}>
            {isArabic ? '1. اختر قالباً هندسياً (اختياري)' : '1. Select a starter template (optional)'}
          </span>
          {selectedTemplate && (
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(null);
                form.setFieldsValue({ name: '', description: '' });
              }}
              className="text-sm text-[#5A5348] hover:text-[#7A5818] dark:hover:text-[#D4B26E] transition-colors font-semibold cursor-pointer"
            >
              {isArabic ? 'إلغاء التحديد' : 'Clear selection'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.key}
              template={tpl}
              isSelected={selectedTemplate === tpl.key}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      </div>

      {/* Project Configuration Card */}
      <Card variant="outlined" className={STYLES.card}>
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
          className="space-y-2"
        >
          {/* Quick Suggested Names */}
          <SuggestedNamesBar
            names={suggestedNames}
            isArabic={isArabic}
            onApplyName={handleApplySuggestedName}
          />

          <Form.Item
            name="name"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'اسم المشروع' : 'Project Name'}
              </span>
            }
            rules={[
              {
                required: true,
                message: isArabic ? 'يرجى إدخال اسم المشروع' : 'Please enter project name',
              },
              {
                min: CONFIG.minNameLength,
                message: isArabic ? 'يجب أن لا يقل عن 3 أحرف' : 'Minimum 3 characters',
              },
              {
                max: CONFIG.maxNameLength,
                message: isArabic ? 'يجب أن لا يزيد عن 80 حرفاً' : 'Maximum 80 characters',
              },
            ]}
          >
            <Input
              placeholder={isArabic ? 'مثال: المنصة الأساسية 2026' : 'e.g. Platform Core Engine'}
              size="large"
              maxLength={CONFIG.maxNameLength}
              showCount
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'أهداف ونطاق العمل' : 'Description & Scope'}
              </span>
            }
            rules={[
              {
                max: CONFIG.maxDescLength,
                message: isArabic ? 'يجب أن لا يزيد عن 1000 حرف' : 'Maximum 1000 characters',
              },
            ]}
          >
            <Input.TextArea
              placeholder={
                isArabic
                  ? 'صف أهداف ومسار عمل هذا المشروع الهندسية...'
                  : 'Describe technical objectives, sprint milestones, and deliverables...'
              }
              rows={4}
              maxLength={CONFIG.maxDescLength}
              showCount
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          {/* Ownership Readout */}
          <OwnerAuthorityBanner ownerName={user?.displayName} isArabic={isArabic} />

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[#736B5E] dark:text-[#9A9183]">
              {isArabic ? 'اضغط ⌘+Enter للإنشاء الفوري' : 'Press ⌘+Enter to submit'}
            </span>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="large" className={STYLES.secondaryButton}>
                  {t('cancel')}
                </Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting}
                iconPlacement="end"
                icon={isRTL ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
                className={STYLES.primarySubmitButton}
              >
                {isArabic ? 'إنشاء مساحة العمل' : 'Initialize Workspace'}
              </Button>
            </div>
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
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
