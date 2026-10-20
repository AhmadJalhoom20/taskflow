'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusOutlined,
  AppstoreOutlined,
  CompassOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useLanguage } from '@/context/LanguageContext';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
const STYLES = {
  cardContainer:
    'rounded-2xl border border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-6 sm:p-10 lg:p-12 shadow-tactile-card dark:shadow-tactile-card-dark text-center',
  stepCard:
    'rounded-xl border border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8]/60 dark:bg-[#1C1A17] p-6 text-center flex flex-col items-center justify-start space-y-3 transition-all hover:border-[#7A5818]/40 dark:hover:border-[#D4B26E]/40',
  primaryButton:
    'tactile-btn !bg-[#7A5818] hover:!bg-[#5E420E] dark:!bg-[#D4B26E] dark:hover:!bg-[#E2C88E] !border-transparent !text-white dark:!text-[#1A1408] font-bold text-base px-8 h-12 rounded-lg shadow-md flex items-center justify-center',
  templateCard:
    'tactile-card rounded-lg border border-[#DDDAD3] dark:border-[#2C2824] p-3.5 bg-white dark:bg-[#1C1A17] hover:border-[#7A5818] dark:hover:border-[#D4B26E] transition-all',
};

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
export interface WorkspaceOnboardingProps {
  userName?: string | null;
}

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
}

interface TemplateCardProps {
  href: string;
  icon: React.ReactNode;
  iconColorClass: string;
  title: string;
  description: string;
}

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================
// Pure layout helpers if needed.

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
function OnboardingStep({ stepNumber, title, description }: StepCardProps) {
  return (
    <div className={STYLES.stepCard}>
      <div className="w-9 h-9 rounded-full bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold text-sm flex items-center justify-center shadow-xs">
        {stepNumber}
      </div>
      <h3 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-sans">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#5A5348] dark:text-[#9A9183] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StarterTemplateCard({
  href,
  icon,
  iconColorClass,
  title,
  description,
}: TemplateCardProps) {
  return (
    <Link href={href} className="block">
      <div className={STYLES.templateCard}>
        <div className={`flex items-center gap-2 mb-1.5 ${iconColorClass}`}>
          {icon}
          <span className="font-bold text-xs text-[#1B1915] dark:text-[#EFE9DD]">{title}</span>
        </div>
        <p className="text-[11px] text-[#5A5348] dark:text-[#9A9183] line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function WorkspaceOnboarding({ userName }: WorkspaceOnboardingProps) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const [showTemplates, setShowTemplates] = useState(false);

  function toggleTemplates() {
    setShowTemplates((prev) => !prev);
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Main Onboarding Card */}
        <div className={STYLES.cardContainer}>
          {/* Header Title & Subtitle */}
          <div className="max-w-2xl mx-auto space-y-3 mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {t('onboardingTitle')}
            </h1>
            <p className="text-sm sm:text-base text-[#5A5348] dark:text-[#9A9183] leading-relaxed">
              {t('onboardingSubtitle')}
            </p>
          </div>

          {/* 3 Step Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <OnboardingStep
              stepNumber={1}
              title={t('onboardingStep1Title')}
              description={t('onboardingStep1Desc')}
            />
            <OnboardingStep
              stepNumber={2}
              title={t('onboardingStep2Title')}
              description={t('onboardingStep2Desc')}
            />
            <OnboardingStep
              stepNumber={3}
              title={t('onboardingStep3Title')}
              description={t('onboardingStep3Desc')}
            />
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/projects/new">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                className={STYLES.primaryButton}
              >
                {t('createFirstProjectBtn')}
              </Button>
            </Link>

            {/* Secondary Option: Templates Accordion */}
            <button
              type="button"
              onClick={toggleTemplates}
              className="text-xs text-[#736B5E] dark:text-[#9A9183] hover:text-[#7A5818] dark:hover:text-[#D4B26E] transition-colors mt-2 underline cursor-pointer"
            >
              {showTemplates
                ? isArabic
                  ? 'إخفاء القوالب الجاهزة'
                  : 'Hide starter templates'
                : t('orChooseTemplate')}
            </button>
          </div>

          {/* Quick-Start Templates Drawer if expanded */}
          {showTemplates && (
            <div className="mt-8 pt-6 border-t border-[#DDDAD3] dark:border-[#2C2824] animate-fadeIn">
              <div className="text-xs uppercase font-semibold tracking-wider text-[#736B5E] dark:text-[#9A9183] mb-4 text-start">
                {t('selectStarterTemplate')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start">
                <StarterTemplateCard
                  href="/projects/new?template=sprint"
                  icon={<AppstoreOutlined />}
                  iconColorClass="text-[#7A5818] dark:text-[#D4B26E]"
                  title={t('engineeringSprint')}
                  description={t('sprintDesc')}
                />

                <StarterTemplateCard
                  href="/projects/new?template=roadmap"
                  icon={<CompassOutlined />}
                  iconColorClass="text-[#1E4D8A] dark:text-[#8DB4E8]"
                  title={t('productRoadmap')}
                  description={t('roadmapDesc')}
                />

                <StarterTemplateCard
                  href="/projects/new?template=triage"
                  icon={<BugOutlined />}
                  iconColorClass="text-[#235832] dark:text-[#9CC5A1]"
                  title={t('architectureTriage')}
                  description={t('triageDesc')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
