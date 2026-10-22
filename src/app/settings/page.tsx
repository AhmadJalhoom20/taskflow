'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect } from 'react';
import {
  BellOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SendOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Card, Switch, Select, Button, Typography, message, Tag, Avatar } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { DataService } from '@/services/dataStore';
import { NotificationService, PushPermissionState } from '@/services/notificationService';
import { UserSettings } from '@/types';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 2. CONFIGURATION & STYLES (EASY EDIT ZONE)
// ============================================================================
const STYLES = {
  container: 'max-w-4xl mx-auto space-y-6 pb-12',
  card: 'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark overflow-hidden',
  sectionHeader: 'pb-3 mb-4 border-b border-[#DDDAD3] dark:border-[#2C2824]',
  settingRow: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#DDDAD3]/50 dark:border-[#2C2824]/50 last:border-b-0',
  primaryBtn:
    'tactile-btn !bg-[var(--accent)] hover:!bg-[var(--accent-hover)] !border-transparent !text-[var(--on-accent)] font-bold text-sm shadow-xs',
  secondaryBtn:
    'tactile-btn border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] hover:border-[#7A5818] dark:hover:border-[#D4B26E] text-xs font-semibold bg-white dark:bg-[#141211]',
};

// ============================================================================
// 6. MAIN COMPONENT (SettingsPage)
// ============================================================================
export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { themeMode, toggleTheme } = useTheme();
  const isArabic = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionState, setPermissionState] = useState<PushPermissionState>('default');

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    reminderHours: 24,
    theme: themeMode,
    language: language,
  });

  // Load initial settings and check push permission status
  useEffect(() => {
    setPermissionState(NotificationService.getPermissionState());

    async function loadSettings() {
      try {
        setLoading(true);
        const data = await DataService.getUserSettings();
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleRequestPushPermission = async () => {
    const res = await NotificationService.requestPushPermission();
    setPermissionState(res);
    if (res === 'granted') {
      message.success(
        isArabic ? 'تم تفعيل إشعارات المتصفح بنجاح.' : 'Browser notifications enabled successfully.'
      );
      setSettings((prev) => ({ ...prev, pushNotifications: true }));
    } else if (res === 'denied') {
      message.warning(
        isArabic
          ? 'تم رفض إذن الإشعارات من المتصفح. يمكنك تفعيلها من إعدادات الموقع بالمتصفح.'
          : 'Notification permission was denied. Please allow it in browser site settings.'
      );
      setSettings((prev) => ({ ...prev, pushNotifications: false }));
    }
  };

  const handleSendTestNotification = () => {
    const success = NotificationService.sendTestNotification(isArabic);
    if (success) {
      message.success(
        isArabic
          ? 'تم إرسال إشعار التجربة بنجاح إلى شاشتك.'
          : 'Test notification triggered successfully.'
      );
    } else {
      message.info(
        isArabic
          ? 'تم إرسال إشعار داخلي (يرجى التأكد من تفعيل إذن المتصفح لظهور إشعارات النظام).'
          : 'Browser push is blocked. Please grant permission in the setting above.'
      );
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await DataService.updateUserSettings(settings);
      message.success(
        isArabic ? 'تم حفظ التفضيلات بنجاح.' : 'Preferences saved successfully.'
      );
    } catch {
      message.error(
        isArabic ? 'تعذر حفظ الإعدادات حالياً.' : 'Failed to save settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={STYLES.container}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDDAD3] dark:border-[#2C2824]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <Title
              level={2}
              className="!mb-0 !text-2xl !font-bold tracking-tight text-[#1B1915] dark:text-[#EFE9DD] font-display"
            >
              {isArabic ? 'إعدادات مساحة العمل' : 'Workspace & Notification Settings'}
            </Title>
          </div>
          <Text className="text-sm text-[#5A5348] dark:text-[#9A9183]">
            {isArabic
              ? 'تخصيص تنبيهات المواعيد النهائية، إشعارات المتصفح والبريد، وإدارة الهوية'
              : 'Configure deadline triggers, push/email dispatch thresholds, and enterprise security'}
          </Text>
        </div>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSaveSettings}
          className={STYLES.primaryBtn}
        >
          {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
        </Button>
      </div>

      {/* SECTION 1: Due Date & Task Reminders */}
      <Card variant="outlined" className={STYLES.card}>
        <div className={STYLES.sectionHeader}>
          <div className="flex items-center gap-2">
            <BellOutlined className="text-base text-[var(--accent)]" />
            <h3 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {isArabic
                ? 'إشعارات المواعيد النهائية للمهام'
                : 'Task Deadline & Due Date Reminders'}
            </h3>
          </div>
          <p className="text-xs text-[#5A5348] dark:text-[#9A9183] mt-0.5">
            {isArabic
              ? 'تلقي تنبيهات عند اقتراب موعد تسليم أي مهمة مسندة إليك عبر المتصفح أو البريد الإلكتروني'
              : 'Receive real-time alerts when assigned tasks approach their deadline'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Browser Push Notifications */}
          <div className={STYLES.settingRow}>
            <div className="space-y-0.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                  {isArabic ? 'إشعارات المتصفح الفورية (Push)' : 'Browser Push Notifications'}
                </span>
                {permissionState === 'granted' ? (
                  <Tag color="success" className="font-mono text-[10px] m-0">
                    <CheckCircleOutlined className="me-1" />
                    {isArabic ? 'مفعل' : 'Active'}
                  </Tag>
                ) : permissionState === 'denied' ? (
                  <Tag color="error" className="font-mono text-[10px] m-0">
                    <WarningOutlined className="me-1" />
                    {isArabic ? 'محظور في المتصفح' : 'Blocked in Browser'}
                  </Tag>
                ) : (
                  <Tag color="default" className="font-mono text-[10px] m-0">
                    {isArabic ? 'يتطلب الإذن' : 'Permission Required'}
                  </Tag>
                )}
              </div>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'إظهار إشعار نظام فوري على سطح المكتب أو الجوال عند اقتراب المهام'
                  : 'Display native desktop notifications when tasks reach alert thresholds'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {permissionState !== 'granted' && (
                <Button
                  size="small"
                  onClick={handleRequestPushPermission}
                  className={STYLES.secondaryBtn}
                >
                  {isArabic ? 'منح الإذن' : 'Request Permission'}
                </Button>
              )}
              <Switch
                checked={settings.pushNotifications && permissionState === 'granted'}
                onChange={(checked) => {
                  if (checked && permissionState !== 'granted') {
                    handleRequestPushPermission();
                  } else {
                    setSettings((prev) => ({ ...prev, pushNotifications: checked }));
                  }
                }}
              />
            </div>
          </div>

          {/* Email Notifications */}
          <div className={STYLES.settingRow}>
            <div className="space-y-0.5 max-w-lg">
              <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'تنبيهات البريد الإلكتروني' : 'Email Deadline Notifications'}
              </span>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'إرسال ملخص بالمهام المستحقة قريباً على بريدك المسجل'
                  : 'Dispatch milestone digest to your registered account email'}
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onChange={(checked) =>
                setSettings((prev) => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          {/* Alert Threshold Selector */}
          <div className={STYLES.settingRow}>
            <div className="space-y-0.5 max-w-lg">
              <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'نافذة التنبيه المسبق' : 'Advance Alert Window'}
              </span>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'الوقت المتبقي قبل تاريخ الاستحقاق لبدء إرسال الإشعارات'
                  : 'How far in advance of the deadline notifications begin firing'}
              </p>
            </div>
            <Select
              value={settings.reminderHours}
              onChange={(val) => setSettings((prev) => ({ ...prev, reminderHours: val }))}
              className="w-48"
              options={[
                { value: 12, label: isArabic ? 'قبل 12 ساعة' : '12 hours before' },
                { value: 24, label: isArabic ? 'قبل 24 ساعة (يوم)' : '24 hours before (1 day)' },
                { value: 48, label: isArabic ? 'قبل 48 ساعة (يومان)' : '48 hours before (2 days)' },
                { value: 72, label: isArabic ? 'قبل 3 أيام' : '3 days before' },
              ]}
            />
          </div>

          {/* Send Test Alert Button */}
          <div className="pt-2 flex items-center justify-between bg-[#EDECE8]/40 dark:bg-[#1C1A17]/40 p-3 rounded-lg border border-[#DDDAD3] dark:border-[#2C2824]">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'اختبار نظام الإشعارات' : 'Test Notification Engine'}
              </span>
              <p className="text-[11px] text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'تأكد من قدرة المتصفح على استقبال الإشعارات الفورية الآن'
                  : 'Verify that push alerts trigger correctly on your current device'}
              </p>
            </div>
            <Button
              icon={<SendOutlined />}
              onClick={handleSendTestNotification}
              className={STYLES.secondaryBtn}
            >
              {isArabic ? 'إرسال إشعار تجريبي' : 'Send Test Alert'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 2: Profile & Identity */}
      <Card variant="outlined" className={STYLES.card}>
        <div className={STYLES.sectionHeader}>
          <div className="flex items-center gap-2">
            <UserOutlined className="text-base text-[var(--accent)]" />
            <h3 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {isArabic ? 'ملف الحساب والصلاحيات' : 'Account & Authority Matrix'}
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <Avatar
              size={52}
              className="font-bold text-lg bg-[var(--accent)] text-[var(--on-accent)] border border-[var(--line)] shadow-xs"
            >
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD]">
                  {user?.displayName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] uppercase text-[#7A5818] dark:text-[#D4B26E]">
                  {user?.role || 'member'}
                </span>
              </div>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183] font-mono">
                {user?.email}
              </p>
            </div>
          </div>

          <div className={STYLES.settingRow}>
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'الأمان والجلسة' : 'Security & Session Durability'}
              </span>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'جلسة مصادقة مشفرة عبر معيار RFC-7519 JWT مع تجديد دوري'
                  : 'Session protected via bcrypt password hash & strict RFC-7519 Bearer token'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#235832] dark:text-[#9CC5A1]">
              <SafetyCertificateOutlined />
              <span>{isArabic ? 'مؤمن' : 'Secured'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Appearance & Language */}
      <Card variant="outlined" className={STYLES.card}>
        <div className={STYLES.sectionHeader}>
          <div className="flex items-center gap-2">
            <GlobalOutlined className="text-base text-[var(--accent)]" />
            <h3 className="font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display">
              {isArabic ? 'المظهر واللغة' : 'Appearance & Localization'}
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className={STYLES.settingRow}>
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'لغة الواجهة' : 'Workspace Language'}
              </span>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'التبديل بين العربية والإنجليزية بكامل عناصر المنظومة'
                  : 'Toggle interface language with full RTL / LTR layout mirroring'}
              </p>
            </div>
            <Select
              value={language}
              onChange={(val) => setLanguage(val as any)}
              className="w-36"
              options={[
                { value: 'ar', label: 'العربية (RTL)' },
                { value: 'en', label: 'English (LTR)' },
              ]}
            />
          </div>

          <div className={STYLES.settingRow}>
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-[#1B1915] dark:text-[#EFE9DD]">
                {isArabic ? 'السمة اللونية' : 'Theme Mode'}
              </span>
              <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
                {isArabic
                  ? 'نظام ألوان عالي التباين مبني على توكنز السويسرية الصارمة'
                  : 'High-contrast typography and monochrome background palette'}
              </p>
            </div>
            <Button onClick={toggleTheme} className={STYLES.secondaryBtn}>
              {themeMode === 'dark'
                ? isArabic
                  ? 'التحويل للوضع النهاري'
                  : 'Switch to Light'
                : isArabic
                ? 'التحويل للوضع الليلي'
                : 'Switch to Dark'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
