'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Avatar,
  Tag,
  Input,
  Button,
  Select,
  Popconfirm,
  Tooltip,
  message,
} from 'antd';
import {
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  MailOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Project, ProjectMemberDetail } from '@/types';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';

// ============================================================================
// 2. CONFIGURATION & STYLES (EASY EDIT ZONE)
// ============================================================================
const CONFIG = {
  modalWidth: 760,
  maxRosterHeight: 420,
} as const;

const STYLES = {
  headerIconBox:
    'w-9 h-9 rounded-lg bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 border border-[#7A5818]/20 dark:border-[#D4B26E]/20 flex items-center justify-center text-[#7A5818] dark:text-[#D4B26E]',
  headerTitle: 'font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display',
  headerSubtitle: 'text-xs text-[#5A5348] dark:text-[#B5AC9C] font-normal',
  countBadge:
    'text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] font-mono',
  inviteInput:
    'rounded-md text-xs sm:text-sm bg-white dark:bg-[#141211] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  inviteSelect:
    'w-44 text-xs sm:text-sm',
  primaryBtn:
    'tactile-btn !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] !text-white dark:!text-[#1A1408] font-bold text-xs sm:text-sm rounded-md shadow-xs',
  tableHeader:
    'text-[10px] uppercase font-mono tracking-wider font-semibold text-[#5A5348] dark:text-[#B5AC9C] py-2 px-3 border-b border-[#DDDAD3] dark:border-[#2C2824]',
  tableRow:
    'py-2.5 px-3 border-b border-[#DDDAD3]/50 dark:border-[#2C2824]/50 hover:bg-[#EDECE8]/40 dark:hover:bg-[#1C1A17]/60 transition-colors',
  ownerTag:
    'm-0 text-xs font-semibold border-blue-500/30 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded',
  maintainerTag:
    'm-0 text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded',
  viewerTag:
    'm-0 text-xs font-semibold border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded',
  memberTag:
    'm-0 text-xs font-semibold border-slate-500/30 bg-slate-500/10 text-slate-300 px-2 py-0.5 rounded',
} as const;

// Helper to determine Domain Title
function getDomainTitle(role: string, email: string): string {
  if (role === 'owner') return 'Lead Architect';
  if (role === 'maintainer') return 'Senior Backend Dev';
  if (role === 'viewer') return 'QA & Compliance';
  if (email.includes('alex') || email.includes('mercer')) return 'Lead Architect';
  if (email.includes('tara') || email.includes('chen')) return 'Senior Backend Dev';
  if (email.includes('sanjay') || email.includes('kumar')) return 'Frontend Engineer';
  if (email.includes('maya') || email.includes('diaz')) return 'Database Engineer';
  return 'Engineering Peer';
}

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
interface TeamRosterModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  currentUserId?: string;
  onProjectUpdate?: (updated: Project) => void;
}

interface MemberRowItem {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  domainTitle: string;
  isOwner: boolean;
}

// ============================================================================
// 6. MAIN COMPONENT (TeamRosterModal)
// ============================================================================
export default function TeamRosterModal({
  open,
  onClose,
  project: initialProject,
  currentUserId,
  onProjectUpdate,
}: TeamRosterModalProps) {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [project, setProject] = useState<Project | null>(initialProject);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'maintainer' | 'viewer'>('member');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');

  // Keep local project state synced when props change
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  // Reset inputs when modal closes
  useEffect(() => {
    if (!open) {
      setInviteEmail('');
      setInviteRole('member');
      setSearchQuery('');
    }
  }, [open]);

  // Determine if current user can manage roles
  const canManage = useMemo(() => {
    if (!project || !currentUserId) return false;
    if (project.ownerId === currentUserId) return true;
    const detail = project.memberDetails?.[currentUserId];
    return detail?.role === 'owner' || detail?.role === 'maintainer';
  }, [project, currentUserId]);

  // Build sorted members list
  const memberRows: MemberRowItem[] = useMemo(() => {
    if (!project || !project.memberIds) return [];

    const list: MemberRowItem[] = project.memberIds.map((mId) => {
      const info: ProjectMemberDetail | undefined = project.memberDetails?.[mId];
      const isOwner = mId === project.ownerId || info?.role === 'owner';
      const role = isOwner ? 'owner' : (info?.role || 'member');
      const email = info?.email || '';

      return {
        uid: mId,
        displayName: info?.displayName || mId,
        email,
        role,
        domainTitle: info?.domainTitle || getDomainTitle(role, email),
        isOwner,
      };
    });

    // Sort: 1) Owner first, 2) Maintainers, 3) Current user, 4) Display name
    list.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      if (a.role === 'maintainer' && b.role !== 'maintainer') return -1;
      if (a.role !== 'maintainer' && b.role === 'maintainer') return 1;
      if (a.uid === currentUserId) return -1;
      if (b.uid === currentUserId) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return list;
  }, [project, currentUserId]);

  // Filtered members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return memberRows;
    const q = searchQuery.toLowerCase().trim();
    return memberRows.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.domainTitle.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [memberRows, searchQuery]);

  // Handle adding new member with specified pre-invite role
  const handleAddMember = async () => {
    if (!project || !currentUserId) return;
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      message.error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    try {
      setIsAdding(true);
      const updated = await DataService.addProjectMember(project.id, cleanEmail, currentUserId, inviteRole);
      setProject(updated);
      onProjectUpdate?.(updated);
      setInviteEmail('');
      setInviteRole('member');
      message.success(
        isArabic
          ? `تمت إضافة العضو بصلاحية ${inviteRole} بنجاح`
          : `Member invited with "${inviteRole}" permission successfully.`
      );
    } catch (err: any) {
      message.error(err?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle changing member role inline (Post-invite permission change)
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!project || !currentUserId) return;
    try {
      const updated = await DataService.updateProjectMemberRole(project.id, memberId, newRole, currentUserId);
      setProject(updated);
      onProjectUpdate?.(updated);
      message.success(
        isArabic ? 'تم تحديث الصلاحية بنجاح' : 'Member role updated successfully'
      );
    } catch (err: any) {
      message.error(err?.message || 'Failed to update member role');
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (memberId: string) => {
    if (!project || !currentUserId) return;
    try {
      const updated = await DataService.removeProjectMember(project.id, memberId, currentUserId);
      setProject(updated);
      onProjectUpdate?.(updated);
      message.success(isArabic ? 'تم إزالة العضو بنجاح' : 'Member removed successfully');
    } catch (err: any) {
      message.error(err?.message || 'Failed to remove member');
    }
  };

  // Handle bulk invites submission
  const handleBulkSubmit = async () => {
    if (!project || !currentUserId) return;
    const lines = bulkEmails
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes('@'));

    if (lines.length === 0) {
      message.warning(isArabic ? 'لم يتم العثور على عناوين بريد صالحة' : 'No valid emails found');
      return;
    }

    let successCount = 0;
    let latestProject = project;

    for (const email of lines) {
      try {
        latestProject = await DataService.addProjectMember(project.id, email, currentUserId, 'member');
        successCount++;
      } catch {
        // Continue with next email
      }
    }

    setProject(latestProject);
    onProjectUpdate?.(latestProject);
    setBulkModalOpen(false);
    setBulkEmails('');
    message.success(
      isArabic
        ? `تمت دعوة ${successCount} أعضاء بنجاح`
        : `Sent ${successCount} invites successfully.`
    );
  };

  if (!project) return null;

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={CONFIG.modalWidth}
        centered
        destroyOnHidden
        title={
          <div className="flex items-center justify-between gap-3 pr-6 pb-2.5 border-b border-[#DDDAD3] dark:border-[#2C2824]">
            <div className="flex items-center gap-3 min-w-0">
              <div className={STYLES.headerIconBox}>
                <TeamOutlined className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={STYLES.headerTitle}>{isArabic ? 'أعضاء المشروع' : 'Project Members'}</span>
                  <span className={STYLES.countBadge}>
                    {project.memberIds.length} {isArabic ? 'إجمالي' : 'Total'}
                  </span>
                </div>
                <div className={STYLES.headerSubtitle}>
                  {isArabic
                    ? 'تحديد صلاحيات المتعاونين ودعوة الزملاء في الفريق'
                    : 'Configure collaborator privileges and invite organizational peers.'}
                </div>
              </div>
            </div>

            {canManage && (
              <Button
                icon={<MailOutlined />}
                size="middle"
                onClick={() => setBulkModalOpen(true)}
                className="border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] font-semibold text-xs sm:text-sm bg-white dark:bg-[#1C1A17]"
              >
                {isArabic ? 'دعوات مجمعة' : 'Send Bulk Invites'}
              </Button>
            )}
          </div>
        }
      >
        <div className="py-3 space-y-4">
          {/* Top Form: Pre-invite Role Specification */}
          {canManage && (
            <div className="p-3 bg-[#EDECE8]/40 dark:bg-[#141211] rounded-lg border border-[#DDDAD3] dark:border-[#2C2824]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1">
                  <Input
                    size="middle"
                    prefix={<UserAddOutlined className="text-[#5A5348] dark:text-[#B5AC9C] me-1" />}
                    placeholder="colleague@university.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onPressEnter={handleAddMember}
                    className={STYLES.inviteInput}
                  />
                </div>

                {/* Pre-invite Role Dropdown */}
                <Select
                  size="middle"
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val)}
                  className={STYLES.inviteSelect}
                  options={[
                    { value: 'member', label: isArabic ? 'عضو (قراءة/كتابة)' : 'Member (Read/Write)' },
                    { value: 'maintainer', label: isArabic ? 'مشرف (إدارة)' : 'Maintainer (Admin)' },
                    { value: 'viewer', label: isArabic ? 'مشاهد (قراءة فقط)' : 'Viewer (Read Only)' },
                  ]}
                />

                <Button
                  type="primary"
                  size="middle"
                  loading={isAdding}
                  onClick={handleAddMember}
                  className={STYLES.primaryBtn}
                >
                  {isArabic ? '+ إضافة عضو' : '+ Add Member'}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Search */}
          <div className="flex items-center justify-between gap-2">
            <Input
              size="middle"
              prefix={<SearchOutlined className="text-[#5A5348] dark:text-[#B5AC9C] text-xs" />}
              placeholder={isArabic ? 'بحث في الأعضاء...' : 'Filter collaborators...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="max-w-xs text-xs bg-white dark:bg-[#141211] border-[#DDDAD3] dark:border-[#2C2824]"
            />
            <span className="text-xs font-mono text-[#5A5348] dark:text-[#9A9183]">
              {filteredMembers.length} {isArabic ? 'عضو' : 'collaborators'}
            </span>
          </div>

          {/* Members Table matching media_1792678900650_b78b4263.png */}
          <div className="border border-[#DDDAD3] dark:border-[#2C2824] rounded-lg overflow-hidden bg-white dark:bg-[#141211]">
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-start text-xs border-collapse">
                <thead className="bg-[#EDECE8]/60 dark:bg-[#1C1A17] sticky top-0 z-10">
                  <tr>
                    <th className={`${STYLES.tableHeader} text-start`}>
                      {isArabic ? 'المتعاون' : 'COLLABORATOR'}
                    </th>
                    <th className={`${STYLES.tableHeader} text-start hidden sm:table-cell`}>
                      {isArabic ? 'المسمى الوظيفي' : 'DOMAIN TITLE'}
                    </th>
                    <th className={`${STYLES.tableHeader} text-start`}>
                      {isArabic ? 'صلاحية المشروع' : 'PROJECT ROLE'}
                    </th>
                    <th className={`${STYLES.tableHeader} text-end`}>
                      {isArabic ? 'الإجراءات' : 'ACTIONS'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDAD3]/60 dark:divide-[#2C2824]">
                  {filteredMembers.map((m) => (
                    <tr key={m.uid} className={STYLES.tableRow}>
                      {/* Collaborator */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            size={32}
                            className={`font-bold text-xs shrink-0 ${
                              m.isOwner
                                ? 'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408]'
                                : 'bg-[#EDECE8] dark:bg-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]'
                            }`}
                          >
                            {m.displayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1B1915] dark:text-[#EFE9DD] truncate flex items-center gap-1">
                              <span className="truncate">{m.displayName}</span>
                              {m.uid === currentUserId && (
                                <span className="text-[10px] font-mono text-[#7A5818] dark:text-[#D4B26E] px-1 py-0.2 rounded bg-[#7A5818]/10">
                                  {isArabic ? 'أنت' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#5A5348] dark:text-[#9A9183] truncate">
                              {m.email || 'user@taskflow.dev'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain Title */}
                      <td className="py-2.5 px-3 text-[#5A5348] dark:text-[#B5AC9C] font-mono text-xs hidden sm:table-cell">
                        {m.domainTitle}
                      </td>

                      {/* Project Role Badge */}
                      <td className="py-2.5 px-3">
                        {m.isOwner ? (
                          <Tag className={STYLES.ownerTag}>Owner</Tag>
                        ) : m.role === 'maintainer' ? (
                          <Tag className={STYLES.maintainerTag}>Maintainer</Tag>
                        ) : m.role === 'viewer' ? (
                          <Tag className={STYLES.viewerTag}>Viewer</Tag>
                        ) : (
                          <Tag className={STYLES.memberTag}>Member</Tag>
                        )}
                      </td>

                      {/* Actions: Inline Role Change & Remove */}
                      <td className="py-2.5 px-3 text-end">
                        {m.isOwner ? (
                          <span className="text-xs italic text-[#5A5348] dark:text-[#9A9183] font-mono">
                            Workspace Owner
                          </span>
                        ) : canManage ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inline Role Selector (Post-invite permission change) */}
                            <Select
                              size="small"
                              value={m.role === 'trainee' ? 'viewer' : m.role}
                              onChange={(val) => handleUpdateRole(m.uid, val)}
                              className="w-28 text-xs text-start"
                              options={[
                                { value: 'maintainer', label: 'Maintainer' },
                                { value: 'member', label: 'Member' },
                                { value: 'viewer', label: 'Viewer' },
                              ]}
                            />

                            {/* Remove Member Button */}
                            <Popconfirm
                              title={isArabic ? 'إزالة العضو من المشروع؟' : 'Remove collaborator?'}
                              description={
                                isArabic
                                  ? 'سيتم إلغاء تعيين أي مهام مرتبطة بهذا العضو.'
                                  : 'Assigned tasks will be reverted to unassigned state.'
                              }
                              onConfirm={() => handleRemoveMember(m.uid)}
                              okText={isArabic ? 'إزالة' : 'Remove'}
                              cancelText={isArabic ? 'إلغاء' : 'Cancel'}
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<UserDeleteOutlined />}
                                className="text-xs"
                                aria-label="Remove member"
                              />
                            </Popconfirm>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#5A5348] dark:text-[#9A9183]">
                            {m.role}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Invites Modal */}
      <Modal
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        onOk={handleBulkSubmit}
        okText={isArabic ? 'إرسال الدعوات' : 'Send Invites'}
        cancelText={isArabic ? 'إلغاء' : 'Cancel'}
        title={
          <div className="flex items-center gap-2 font-bold text-sm">
            <MailOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
            <span>{isArabic ? 'إرسال دعوات مجمعة' : 'Send Bulk Invites'}</span>
          </div>
        }
      >
        <div className="py-2 space-y-2">
          <p className="text-xs text-[#5A5348] dark:text-[#9A9183]">
            {isArabic
              ? 'أدخل عناوين البريد الإلكتروني للمتعاونين مفصولة بأسطر جديدة أو فواصل:'
              : 'Enter emails separated by newlines or commas. They will be added as Members:'}
          </p>
          <Input.TextArea
            rows={5}
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="colleague1@university.edu&#10;colleague2@university.edu"
            className="text-xs font-mono"
          />
        </div>
      </Modal>
    </>
  );
}
