'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Avatar, Tag, Input, Button, Segmented, Tooltip } from 'antd';
import {
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Project, ProjectMemberDetail } from '@/types';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Edit modal width, styling tokens, and role badges here.
const CONFIG = {
  modalWidth: 560,
  maxRosterHeight: 380,
} as const;

const STYLES = {
  headerIconBox:
    'w-9 h-9 rounded-lg bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 border border-[#7A5818]/20 dark:border-[#D4B26E]/20 flex items-center justify-center text-[#7A5818] dark:text-[#D4B26E]',
  headerTitle: 'font-bold text-base text-[#1B1915] dark:text-[#EFE9DD] font-display truncate',
  headerSubtitle: 'text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] font-normal',
  countBadge:
    'text-sm font-semibold px-2.5 py-0.5 rounded-md bg-[#EDECE8] dark:bg-[#1C1A17] border border-[#DDDAD3] dark:border-[#2C2824] text-[#5A5348] dark:text-[#B5AC9C] font-mono tnum',
  searchInput:
    'sm:w-56 text-sm bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  memberRow:
    'flex items-center justify-between py-2.5 px-2 hover:bg-[#EDECE8]/50 dark:hover:bg-[#1C1A17] rounded-lg transition-colors',
  ownerAvatar:
    'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408] font-bold flex-shrink-0 border border-[#7A5818]/30 dark:border-[#D4B26E]/30 text-sm',
  memberAvatar:
    'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] font-semibold flex-shrink-0 border border-[#DDDAD3] dark:border-[#2C2824] text-sm',
  youBadge:
    'text-xs font-mono px-1.5 py-0.2 rounded bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 text-[#7A5818] dark:text-[#D4B26E] border border-[#7A5818]/20 dark:border-[#D4B26E]/20',
  ownerTag:
    'm-0 text-xs font-semibold border-[#7A5818]/30 dark:border-[#D4B26E]/30 bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 text-[#7A5818] dark:text-[#D4B26E] cursor-default px-2 py-0.5',
  memberTag:
    'm-0 text-xs font-medium border-[#DDDAD3] dark:border-[#2C2824] bg-[#EDECE8] dark:bg-[#1C1A17] text-[#5A5348] dark:text-[#B5AC9C] cursor-default px-2 py-0.5',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
interface TeamRosterModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  currentUserId?: string;
}

type RoleFilter = 'all' | 'lead' | 'member';

interface RosterMemberItem {
  uid: string;
  displayName: string;
  email: string;
  role: 'owner' | 'member';
  isOwner: boolean;
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function buildAndSortMembers(
  project: Project | null,
  currentUserId?: string
): RosterMemberItem[] {
  if (!project || !project.memberIds) return [];

  const list: RosterMemberItem[] = project.memberIds.map((mId) => {
    const info: ProjectMemberDetail | undefined = project.memberDetails?.[mId];
    const isOwner = mId === project.ownerId || info?.role === 'owner';
    return {
      uid: mId,
      displayName: info?.displayName || mId,
      email: info?.email || '',
      role: isOwner ? 'owner' : 'member',
      isOwner,
    };
  });

  // Sort: 1) Leads / Owners first, 2) Logged in user, 3) Alphabetical by display name
  list.sort((a, b) => {
    if (a.isOwner && !b.isOwner) return -1;
    if (!a.isOwner && b.isOwner) return 1;
    if (a.uid === currentUserId) return -1;
    if (b.uid === currentUserId) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return list;
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
interface MemberListItemRowProps {
  member: RosterMemberItem;
  currentUserId?: string;
  t: (key: TranslationKey) => string;
}

function MemberListItemRow({ member, currentUserId, t }: MemberListItemRowProps) {
  const isCurrentUser = member.uid === currentUserId;

  return (
    <div className={STYLES.memberRow}>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          size={36}
          className={member.isOwner ? STYLES.ownerAvatar : STYLES.memberAvatar}
        >
          {member.displayName.charAt(0).toUpperCase()}
        </Avatar>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD] flex items-center gap-1.5 truncate">
            <span dir="auto" className="truncate">
              {member.displayName}
            </span>
            {isCurrentUser && <span className={STYLES.youBadge}>{t('youBadge')}</span>}
          </div>
          <div className="text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C] font-mono truncate">
            {member.email || t('noEmailRegistered')}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 ms-3">
        {member.isOwner ? (
          <Tooltip title={t('projectLead')}>
            <Tag
              icon={<CrownOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />}
              className={STYLES.ownerTag}
            >
              {t('projectLead')}
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title={t('member')}>
            <Tag
              icon={<UserOutlined className="text-[#5A5348] dark:text-[#B5AC9C]" />}
              className={STYLES.memberTag}
            >
              {t('member')}
            </Tag>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function TeamRosterModal({
  open,
  onClose,
  project,
  currentUserId,
}: TeamRosterModalProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Reset filters when modal closes/opens
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setRoleFilter('all');
    }
  }, [open]);

  // Derived Members List (No redundant useEffects)
  const membersList = useMemo(
    () => buildAndSortMembers(project, currentUserId),
    [project, currentUserId]
  );

  const filteredMembers = useMemo(() => {
    let result = membersList;

    if (roleFilter === 'lead') {
      result = result.filter((m) => m.isOwner);
    } else if (roleFilter === 'member') {
      result = result.filter((m) => !m.isOwner);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [membersList, roleFilter, searchQuery]);

  const leadsCount = useMemo(
    () => membersList.filter((m) => m.isOwner).length,
    [membersList]
  );
  const regularMembersCount = membersList.length - leadsCount;

  if (!project) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-[#5A5348] dark:text-[#B5AC9C] font-mono">
            {leadsCount}{' '}
            {leadsCount === 1 ? t('leadersCountSuffix') : t('leadersCountSuffixPlural')} •{' '}
            {regularMembersCount}{' '}
            {regularMembersCount === 1 ? t('membersCountSuffix') : t('membersCountSuffixPlural')}
          </span>
          <Tooltip title={t('closeBtn')}>
            <Button
              size="middle"
              onClick={onClose}
              className="border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD] font-semibold text-sm"
            >
              {t('closeBtn')}
            </Button>
          </Tooltip>
        </div>
      }
      title={
        <div className="flex items-center justify-between gap-3 pr-6 pb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={STYLES.headerIconBox}>
              <TeamOutlined className="text-base" />
            </div>
            <div className="min-w-0">
              <div dir="auto" className={STYLES.headerTitle}>
                {project.name}
              </div>
              <div className={STYLES.headerSubtitle}>
                {t('teamRosterSubtitle')}
              </div>
            </div>
          </div>
          <span className={STYLES.countBadge}>
            {project.memberIds.length}{' '}
            {project.memberIds.length === 1
              ? t('membersCountSuffix')
              : t('membersCountSuffixPlural')}
          </span>
        </div>
      }
      width={CONFIG.modalWidth}
      centered
      destroyOnHidden
    >
      <div className="py-3 space-y-3">
        {/* Controls: Role filter + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <Segmented
            size="middle"
            value={roleFilter}
            onChange={(val) => setRoleFilter(val as RoleFilter)}
            options={[
              { label: `${t('filterAll')} (${membersList.length})`, value: 'all' },
              { label: `${t('filterLeaders')} (${leadsCount})`, value: 'lead' },
              { label: `${t('filterMembers')} (${regularMembersCount})`, value: 'member' },
            ]}
            className="bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD] text-sm"
          />

          <Tooltip title={t('searchMembersPlaceholder')}>
            <Input
              size="middle"
              prefix={<SearchOutlined className="text-[#5A5348] dark:text-[#B5AC9C] text-sm" />}
              placeholder={t('searchMembersPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className={STYLES.searchInput}
            />
          </Tooltip>
        </div>

        {/* Member List */}
        <div className="divide-y divide-[#DDDAD3] dark:divide-[#2C2824] max-h-[380px] overflow-y-auto pr-1">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#5A5348] dark:text-[#B5AC9C]">
              {t('noMembersMatch')}
            </div>
          ) : (
            filteredMembers.map((member) => (
              <MemberListItemRow
                key={member.uid}
                member={member}
                currentUserId={currentUserId}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
