'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Avatar, Tag, Input, Button, Segmented } from 'antd';
import {
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Project, ProjectMemberDetail } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface TeamRosterModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  currentUserId?: string;
}

type RoleFilter = 'all' | 'lead' | 'member';

export default function TeamRosterModal({
  open,
  onClose,
  project,
  currentUserId,
}: TeamRosterModalProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Reset filters when modal closes/opens
  React.useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setRoleFilter('all');
    }
  }, [open]);

  const membersList = useMemo(() => {
    if (!project || !project.memberIds) return [];

    const list: Array<{
      uid: string;
      displayName: string;
      email: string;
      role: 'owner' | 'member';
      isOwner: boolean;
    }> = project.memberIds.map((mId) => {
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

    // Sort: 1) Leaders / Owners first, 2) Logged in user, 3) Alphabetical by name
    list.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      if (a.uid === currentUserId) return -1;
      if (b.uid === currentUserId) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return list;
  }, [project, currentUserId]);

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
          <span className="text-xs text-slate-400 font-mono">
            {leadsCount} {leadsCount === 1 ? t('leadersCountSuffix') : t('leadersCountSuffixPlural')} • {regularMembersCount} {regularMembersCount === 1 ? t('membersCountSuffix') : t('membersCountSuffixPlural')}
          </span>
          <Button size="small" onClick={onClose}>
            {t('closeBtn')}
          </Button>
        </div>
      }
      title={
        <div className="flex items-center justify-between gap-3 pr-6 pb-2 border-b border-slate-100 dark:border-[#1e2430]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TeamOutlined className="text-sm" />
            </div>
            <div className="min-w-0">
              <div dir="auto" className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                {project.name}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {t('teamRosterSubtitle')}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#171c26] border border-slate-200 dark:border-[#1e2430] text-slate-600 dark:text-slate-400 font-mono tnum">
            {project.memberIds.length} {project.memberIds.length === 1 ? t('membersCountSuffix') : t('membersCountSuffixPlural')}
          </span>
        </div>
      }
      width={520}
      centered
      destroyOnHidden
    >
      <div className="py-3 space-y-3">
        {/* Controls: Role filter + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <Segmented
            size="small"
            value={roleFilter}
            onChange={(val) => setRoleFilter(val as RoleFilter)}
            options={[
              { label: `${t('filterAll')} (${membersList.length})`, value: 'all' },
              { label: `${t('filterLeaders')} (${leadsCount})`, value: 'lead' },
              { label: `${t('filterMembers')} (${regularMembersCount})`, value: 'member' },
            ]}
            className="bg-slate-100 dark:bg-[#171c26]"
          />

          <Input
            size="small"
            prefix={<SearchOutlined className="text-slate-400 text-xs" />}
            placeholder={t('searchMembersPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="sm:w-48 text-xs"
          />
        </div>

        {/* Member List */}
        <div className="divide-y divide-slate-100 dark:divide-[#1e2430] max-h-[360px] overflow-y-auto pr-1">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t('noMembersMatch')}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isCurrentUser = member.uid === currentUserId;

              return (
                <div
                  key={member.uid}
                  className="flex items-center justify-between py-2.5 px-1.5 hover:bg-slate-50 dark:hover:bg-[#161b24] rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      size={34}
                      className={
                        member.isOwner
                          ? 'bg-amber-600 text-white font-bold flex-shrink-0 border border-amber-500/40'
                          : 'bg-slate-700 text-white font-semibold flex-shrink-0 border border-slate-600/40'
                      }
                    >
                      {member.displayName.charAt(0).toUpperCase()}
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                        <span dir="auto" className="truncate">{member.displayName}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {t('youBadge')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {member.email || t('noEmailRegistered')}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-3">
                    {member.isOwner ? (
                      <Tag
                        icon={<CrownOutlined className="text-amber-500" />}
                        className="m-0 text-[11px] font-semibold border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      >
                        {t('projectLead')}
                      </Tag>
                    ) : (
                      <Tag
                        icon={<UserOutlined className="text-slate-400" />}
                        className="m-0 text-[11px] font-medium border-slate-200 dark:border-[#1e2430] bg-slate-50 dark:bg-[#171c26] text-slate-600 dark:text-slate-300"
                      >
                        {t('member')}
                      </Tag>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
