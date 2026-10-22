'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React from 'react';
import { Modal, Typography } from 'antd';
import {
  CompassOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useLanguage } from '@/context/LanguageContext';

const { Title, Text } = Typography;

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================
export interface ShortcutItem {
  keys: readonly string[];
  secondaryKeys?: readonly string[];
  descEn: string;
  descAr: string;
}

export interface ShortcutCategory {
  categoryEn: string;
  categoryAr: string;
  icon: React.ComponentType<any>;
  items: ShortcutItem[];
}

export interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// 3. CONFIGURATION & SHORTCUTS DICTIONARY (EASY EDIT ZONE)
// ============================================================================
const SHORTCUT_GROUPS: ShortcutCategory[] = [
  {
    categoryEn: 'Navigation',
    categoryAr: 'التنقل السريع',
    icon: CompassOutlined,
    items: [
      {
        keys: ['G', 'D'],
        descEn: 'Go to Workspace Dashboard',
        descAr: 'الانتقال إلى لوحة التحكم',
      },
      {
        keys: ['G', 'P'],
        descEn: 'Browse Projects',
        descAr: 'استعراض المشاريع',
      },
      {
        keys: ['G', 'S'],
        descEn: 'Open Workspace Settings',
        descAr: 'فتح إعدادات مساحة العمل',
      },
    ],
  },
  {
    categoryEn: 'Search & Commands',
    categoryAr: 'البحث والأوامر',
    icon: ThunderboltOutlined,
    items: [
      {
        keys: ['Cmd', 'K'],
        secondaryKeys: ['Ctrl', 'K'],
        descEn: 'Open Command Palette & Global Search',
        descAr: 'فتح لوحة الأوامر والبحث الشامل',
      },
      {
        keys: ['/'],
        descEn: 'Quick filter tasks in current view',
        descAr: 'تصفية وبحث سريع في مهام العرض الحالي',
      },
    ],
  },
  {
    categoryEn: 'Workflows & Actions',
    categoryAr: 'سير العمل والإجراءات',
    icon: AppstoreOutlined,
    items: [
      {
        keys: ['N'],
        descEn: 'Create New Project',
        descAr: 'إنشاء مشروع جديد',
      },
      {
        keys: ['C'],
        descEn: 'Add Task to Board',
        descAr: 'إضافة مهمة جديدة للوحة',
      },
      {
        keys: ['['],
        secondaryKeys: ['Ctrl', 'B'],
        descEn: 'Toggle Sidebar collapse',
        descAr: 'طي / توسيع الشريط الجانبي',
      },
      {
        keys: ['?'],
        descEn: 'Open Keyboard Shortcuts cheat sheet',
        descAr: 'فتح دليل اختصارات لوحة المفاتيح',
      },
      {
        keys: ['Esc'],
        descEn: 'Close active modal, drawer or blur input',
        descAr: 'إغلاق النوافذ المنبثقة أو إلغاء التحديد',
      },
    ],
  },
];

// ============================================================================
// 4. SUB-COMPONENTS
// ============================================================================
function KeyBadge({ keyText }: { keyText: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-mono font-semibold text-[var(--text)] bg-[var(--surface-2)] border border-[var(--line-strong)] rounded shadow-xs select-none">
      {keyText}
    </kbd>
  );
}

// ============================================================================
// 5. MAIN COMPONENT
// ============================================================================
export default function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={620}
      closeIcon={<CloseOutlined className="text-[var(--text-2)] hover:text-[var(--text)]" />}
      styles={{
        body: {
          padding: 0,
          backgroundColor: 'var(--bg)',
        },
      }}
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <Title
                level={4}
                className="!mb-0 !text-base !font-bold text-[var(--text)] font-display"
              >
                {isArabic ? 'اختصارات لوحة المفاتيح' : 'Application Keyboard Shortcuts'}
              </Title>
            </div>
            <Text className="text-xs text-[var(--text-2)]">
              {isArabic
                ? 'تنقل بسرعة ودقة عالية باستخدام الاختصارات المعتمدة'
                : 'Navigate and trigger actions across TaskFlow with deterministic speed'}
            </Text>
          </div>
          <div className="flex items-center gap-1">
            <KeyBadge keyText="?" />
          </div>
        </div>

        {/* Shortcuts List by Categories */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pe-1">
          {SHORTCUT_GROUPS.map((group) => {
            const IconComp = group.icon;
            return (
              <div
                key={group.categoryEn}
                className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                  <IconComp className="text-sm text-[var(--accent)]" />
                  <span>{isArabic ? group.categoryAr : group.categoryEn}</span>
                </div>

                <div className="divide-y divide-[var(--line)]">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2 first:pt-1 last:pb-1 flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="text-[var(--text)] font-medium">
                        {isArabic ? item.descAr : item.descEn}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={k}>
                            {kIdx > 0 && (
                              <span className="text-[10px] text-[var(--text-3)] font-mono">
                                +
                              </span>
                            )}
                            <KeyBadge keyText={k} />
                          </React.Fragment>
                        ))}
                        {item.secondaryKeys && item.secondaryKeys.length > 0 && (
                          <>
                            <span className="text-[10px] text-[var(--text-3)]">
                              {isArabic ? 'أو' : 'or'}
                            </span>
                            {item.secondaryKeys.map((sk: string, skIdx: number) => (
                              <React.Fragment key={sk}>
                                {skIdx > 0 && (
                                  <span className="text-[10px] text-[var(--text-3)] font-mono">
                                    +
                                  </span>
                                )}
                                <KeyBadge keyText={sk} />
                              </React.Fragment>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--text-2)]">
          <span>
            {isArabic
              ? 'اضغط ? في أي وقت لفتح هذه اللائحة مجدداً'
              : 'Press ? anywhere in the workspace to reopen this guide'}
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)]">
            Esc {isArabic ? 'للإغلاق' : 'to close'}
          </kbd>
        </div>
      </div>
    </Modal>
  );
}
