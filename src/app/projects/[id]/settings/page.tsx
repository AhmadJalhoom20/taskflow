'use client';

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import {
  Card,
  Form,
  Input,
  Button,
  List,
  Tag,
  Avatar,
  Popconfirm,
  Alert,
  Modal,
  Select,
  Typography,
  App,
} from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, TranslationKey } from '@/context/LanguageContext';
import { DataService } from '@/services/dataStore';
import { Project } from '@/types';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 2. CONFIGURATION, CONSTANTS & STYLES (EASY EDIT ZONE)
// ============================================================================
// Edit validation rules, character limits, and visual design tokens here.
const CONFIG = {
  minProjectNameLength: 3,
  maxProjectNameLength: 80,
  maxDescriptionLength: 1000,
} as const;

const STYLES = {
  container: 'max-w-5xl mx-auto space-y-6 py-4',
  backButton: '!px-0 mb-2 !text-[#7A5818] dark:!text-[#D4B26E] font-semibold',
  pageTitle: '!mb-0 !text-xl !font-bold font-display text-[#1B1915] dark:text-[#EFE9DD]',
  pageSubtitle: 'text-xs !text-[#5A5348] dark:!text-[#B5AC9C]',
  tactileCard:
    'tactile-card border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] shadow-tactile-card dark:shadow-tactile-card-dark',
  inputBase:
    'rounded text-sm bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]',
  primarySaveButton:
    'tactile-btn !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] !text-white dark:!text-[#1A1408] font-bold px-6 shadow-xs rounded text-sm',
  primaryAddButton:
    'tactile-btn !bg-[#7A5818] dark:!bg-[#D4B26E] hover:!bg-[#5e4310] dark:hover:!bg-[#e5c583] !border-[#7A5818] dark:!border-[#D4B26E] !text-white dark:!text-[#1A1408] font-bold rounded text-sm',
  dangerCard:
    'border-rose-300/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 rounded-xl',
  ownerRbacTag:
    'm-0 text-xs font-mono font-bold uppercase border-[#7A5818]/30 dark:border-[#D4B26E]/30 bg-[#7A5818]/10 dark:bg-[#D4B26E]/10 text-[#7A5818] dark:text-[#D4B26E] px-2 py-0.5',
} as const;

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================
interface GeneralSettingsFormValues {
  name: string;
  description?: string;
}

interface AddMemberFormValues {
  email: string;
  role: 'member' | 'maintainer' | 'viewer';
}

// ============================================================================
// 4. HELPER FUNCTIONS & HOOKS
// ============================================================================
function isNonEmptyString(val?: string | null): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================
interface AccessDeniedCardProps {
  projectId: string;
  isRTL: boolean;
}

function AccessDeniedCard({ projectId, isRTL }: AccessDeniedCardProps) {
  return (
    <Card className="max-w-md mx-auto text-center py-12 mt-8 border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211]">
      <ExclamationCircleOutlined className="text-3xl text-rose-500 mb-3" />
      <Title level={4} className="font-display !text-[#1B1915] dark:!text-[#EFE9DD]">
        {isRTL ? 'تم رفض الوصول' : 'Access Denied'}
      </Title>
      <Text type="secondary" className="block mb-6 !text-[#5A5348] dark:!text-[#B5AC9C]">
        {isRTL
          ? 'مالك المشروع فقط يملك صلاحية تعديل الإعدادات وإدارة الأعضاء.'
          : 'Only the Project Owner has permission to manage project settings and membership.'}
      </Text>
      <Link href={`/projects/${projectId}`}>
        <Button
          type="primary"
          icon={isRTL ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
          className="!bg-[#7A5818] dark:!bg-[#D4B26E] !border-[#7A5818] dark:!border-[#D4B26E] !text-white dark:!text-[#1A1408] font-bold"
        >
          {isRTL ? 'العودة للمشروع' : 'Return to Project'}
        </Button>
      </Link>
    </Card>
  );
}

function SettingsLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-[#EDECE8] dark:bg-[#1C1A17] rounded" />
        <div className="h-8 w-56 bg-[#EDECE8] dark:bg-[#1C1A17] rounded-lg" />
      </div>
      <Card
        variant="outlined"
        className="border-[#DDDAD3] dark:border-[#2C2824] bg-white dark:bg-[#141211] p-4 space-y-4"
      >
        <div className="h-4 w-40 bg-[#EDECE8] dark:bg-[#1C1A17] rounded mb-3" />
        <div className="h-10 w-full bg-[#EDECE8] dark:bg-[#1C1A17] rounded-lg" />
        <div className="h-20 w-full bg-[#EDECE8] dark:bg-[#1C1A17] rounded-lg" />
      </Card>
    </div>
  );
}

interface MemberRowProps {
  memberId: string;
  project: Project;
  currentUserId?: string;
  t: (key: TranslationKey) => string;
  onRemoveMember: (id: string) => void;
  onUpdateRole: (id: string, role: string) => void;
}

function MemberRow({ memberId, project, currentUserId, t, onRemoveMember, onUpdateRole }: MemberRowProps) {
  const member = project.memberDetails?.[memberId];
  const isProjectOwner = memberId === project.ownerId;
  const isCurrentUser = memberId === currentUserId;
  const currentRole = isProjectOwner ? 'owner' : (member?.role || 'member');

  return (
    <List.Item
      className="py-3 px-2 rounded hover:bg-[#EDECE8]/50 dark:hover:bg-[#1C1A17] transition-colors"
      actions={[
        isProjectOwner ? (
          <span key="owner-action" className="text-xs italic text-[#5A5348] dark:text-[#9A9183] font-mono">
            Workspace Owner
          </span>
        ) : (
          <div key="actions" className="flex items-center gap-2">
            <Select
              size="small"
              value={currentRole === 'trainee' ? 'viewer' : currentRole}
              onChange={(newRole) => onUpdateRole(memberId, newRole)}
              className="w-28 text-xs"
              options={[
                { value: 'maintainer', label: 'Maintainer' },
                { value: 'member', label: 'Member' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
            <Popconfirm
              title={t('removeMemberConfirmTitle')}
              description={t('removeMemberConfirmDesc')}
              onConfirm={() => onRemoveMember(memberId)}
              okText={t('removeAction')}
              cancelText={t('cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                size="middle"
                icon={<UserDeleteOutlined />}
                className="text-sm"
              >
                {t('removeMemberAction')}
              </Button>
            </Popconfirm>
          </div>
        ),
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={36}
            className={`font-bold text-sm ${
              isProjectOwner
                ? 'bg-[#7A5818] dark:bg-[#D4B26E] text-white dark:text-[#1A1408]'
                : 'bg-[#EDECE8] dark:bg-[#1C1A17] text-[#1B1915] dark:text-[#EFE9DD]'
            }`}
          >
            {member?.displayName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        }
        title={
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-[#1B1915] dark:text-[#EFE9DD]">
              {member?.displayName || memberId}
            </span>
            {isCurrentUser && (
              <span className="text-xs font-mono text-[#7A5818] dark:text-[#D4B26E] font-semibold">
                ({t('youIndicator')})
              </span>
            )}
            <Tag
              className={`m-0 text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded ${
                isProjectOwner
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  : currentRole === 'maintainer'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : currentRole === 'viewer'
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
              }`}
            >
              {currentRole}
            </Tag>
          </div>
        }
        description={
          <span className="font-mono text-xs sm:text-sm text-[#5A5348] dark:text-[#B5AC9C]">
            {member?.email || 'Registered User'}
          </span>
        }
      />
    </List.Item>
  );
}

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  confirmName: string;
  isDeleting: boolean;
  t: (key: TranslationKey) => string;
  onConfirmNameChange: (val: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function DeleteProjectModal({
  isOpen,
  projectName,
  confirmName,
  isDeleting,
  t,
  onConfirmNameChange,
  onCancel,
  onDelete,
}: DeleteProjectModalProps) {
  const isMatch = confirmName.trim() === projectName.trim();

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-[#DDDAD3] dark:border-[#2C2824]">
          <ExclamationCircleOutlined />
          <span>{t('confirmDeleteModalTitle')}</span>
        </div>
      }
    >
      <div className="py-4 space-y-4">
        <Alert
          type="error"
          showIcon
          title={t('irreversibleActionNotice')}
          description={t('cascadeNoticeDetails')}
          className="text-xs rounded-md"
        />

        <div className="space-y-2 text-xs">
          <p className="text-[#1B1915] dark:text-[#EFE9DD]">
            {t('typeToConfirmPrompt')}:{' '}
            <strong className="font-mono text-[#7A5818] dark:text-[#D4B26E] select-all">
              {projectName}
            </strong>
          </p>
          <Input
            value={confirmName}
            onChange={(e) => onConfirmNameChange(e.target.value)}
            placeholder={projectName}
            size="large"
            className="font-mono text-xs rounded bg-white dark:bg-[#1C1A17] border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button
            onClick={onCancel}
            className="rounded font-semibold border-[#DDDAD3] dark:border-[#2C2824] text-[#1B1915] dark:text-[#EFE9DD]"
          >
            {t('cancel')}
          </Button>
          <Button
            danger
            type="primary"
            loading={isDeleting}
            disabled={!isMatch}
            onClick={onDelete}
            className="font-bold rounded"
          >
            {t('permanentlyDeleteProject')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// 6. MAIN COMPONENT
// ============================================================================
export default function ProjectSettingsPage() {
  const { message } = App.useApp();
  const { t, isRTL } = useLanguage();
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projectForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  // --- Component State ---
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // --- Initial Data Loading ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && projectId) {
      loadProject();
    }
  }, [user, authLoading, projectId]);

  async function loadProject() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const proj = await DataService.getProjectById(projectId, user.uid);
      if (!proj) {
        setError('Project not found.');
        return;
      }

      if (proj.ownerId !== user.uid) {
        setError('UNAUTHORIZED: Only the project owner can access project settings.');
        return;
      }

      setProject(proj);
    } catch (err: any) {
      setError(err?.message || 'Access Denied.');
    } finally {
      setLoading(false);
    }
  }

  // --- Synchronize Loaded Project with Form ---
  useEffect(() => {
    if (project) {
      projectForm.setFieldsValue({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [project, projectForm]);

  // --- Action Handlers ---
  const handleUpdateGeneral = async (values: GeneralSettingsFormValues) => {
    if (!user || !project) return;
    const trimmedName = values.name.trim();

    try {
      setIsUpdating(true);
      const updated = await DataService.updateProject(
        projectId,
        trimmedName,
        values.description || '',
        user.uid
      );
      setProject(updated);
      message.success(t('projectUpdatedSuccess'));
    } catch (err: any) {
      message.error(err?.message || 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMember = async (values: AddMemberFormValues) => {
    if (!user || !project) return;
    const email = values.email.trim();
    const role = values.role || 'member';

    try {
      setIsAddingMember(true);
      const updated = await DataService.addProjectMember(projectId, email, user.uid, role);
      setProject(updated);
      memberForm.resetFields();
      message.success(t('memberAddedSuccess'));
    } catch (err: any) {
      message.error(err?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!user || !project) return;
    try {
      const updated = await DataService.updateProjectMemberRole(projectId, memberId, newRole, user.uid);
      setProject(updated);
      message.success(isRTL ? 'تم تحديث صلاحية العضو بنجاح' : 'Member role updated successfully');
    } catch (err: any) {
      message.error(err?.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user || !project) return;
    if (memberId === project.ownerId) {
      message.error('The project owner cannot be removed.');
      return;
    }

    try {
      const updated = await DataService.removeProjectMember(projectId, memberId, user.uid);
      setProject(updated);
      message.success(t('memberRemovedSuccess'));
    } catch (err: any) {
      message.error(err?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!user || !project) return;
    if (confirmDeleteName.trim() !== project.name.trim()) {
      message.error('Please type the exact project name to confirm deletion');
      return;
    }

    try {
      setIsDeletingProject(true);
      await DataService.deleteProject(projectId, user.uid);
      message.success(t('projectDeletedSuccess'));
      router.push('/dashboard');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete project');
      setIsDeletingProject(false);
    }
  };

  // --- Guard Clauses ---
  if (loading || authLoading) {
    return <SettingsLoadingSkeleton />;
  }

  if (error && error.includes('UNAUTHORIZED')) {
    return <AccessDeniedCard projectId={projectId} isRTL={isRTL} />;
  }

  if (!project) return null;

  return (
    <div className={STYLES.container}>
      {/* Header and Back Link */}
      <div>
        <Link href={`/projects/${project.id}`}>
          <Button
            type="link"
            icon={isRTL ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
            className={STYLES.backButton}
          >
            {t('backToProject')} {project.name}
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <SettingOutlined className="text-2xl text-[#7A5818] dark:text-[#D4B26E]" />
          <div>
            <Title level={2} className={STYLES.pageTitle}>
              {t('projectSettingsTitle')}
            </Title>
            <Text type="secondary" className={STYLES.pageSubtitle}>
              {t('projectSettingsSubtitle')}
            </Text>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <Card
        title={
          <span className="font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display text-base">
            {t('generalInformation')}
          </span>
        }
        variant="outlined"
        className={STYLES.tactileCard}
      >
        <Form
          form={projectForm}
          layout="vertical"
          onFinish={handleUpdateGeneral}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {t('projectNameLabel')}
              </span>
            }
            rules={[
              { required: true, message: 'Please enter a project name' },
              { min: CONFIG.minProjectNameLength, message: 'Minimum 3 characters' },
              { max: CONFIG.maxProjectNameLength, message: 'Maximum 80 characters' },
            ]}
          >
            <Input
              showCount
              maxLength={CONFIG.maxProjectNameLength}
              size="large"
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-sm font-semibold text-[#1B1915] dark:text-[#EFE9DD]">
                {t('objectivesScopeLabel')}
              </span>
            }
            rules={[{ max: CONFIG.maxDescriptionLength, message: 'Max 1000 characters' }]}
          >
            <Input.TextArea
              showCount
              maxLength={CONFIG.maxDescriptionLength}
              rows={3}
              dir="auto"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <div className="flex justify-end">
            <Button
              type="primary"
              size="middle"
              htmlType="submit"
              loading={isUpdating}
              className={STYLES.primarySaveButton}
            >
              {t('saveProjectSettings')}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Team Membership Management */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-[#7A5818] dark:text-[#D4B26E]" />
            <span className="font-bold text-[#1B1915] dark:text-[#EFE9DD] font-display text-base">
              {t('teamMembersSection')} ({project.memberIds.length})
            </span>
          </div>
        }
        variant="outlined"
        className={STYLES.tactileCard}
      >
        <Paragraph className="text-sm !text-[#5A5348] dark:!text-[#B5AC9C] !mb-4 leading-relaxed">
          {t('addMemberDesc')}
        </Paragraph>

        {/* Add Member Form */}
        <Form
          form={memberForm}
          layout="inline"
          initialValues={{ role: 'member' }}
          onFinish={handleAddMember}
          className="mb-6 flex flex-wrap sm:flex-nowrap gap-2"
        >
          <Form.Item
            name="email"
            className="flex-1 !me-0 min-w-[200px]"
            rules={[
              { required: true, message: 'Enter member email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              size="middle"
              prefix={<MailOutlined className="text-[#5A5348] dark:text-[#B5AC9C] me-2" />}
              placeholder="colleague@university.edu"
              className={STYLES.inputBase}
            />
          </Form.Item>

          <Form.Item name="role" className="!me-0 w-44">
            <Select
              size="middle"
              options={[
                { value: 'member', label: isRTL ? 'عضو (قراءة/كتابة)' : 'Member (Read/Write)' },
                { value: 'maintainer', label: isRTL ? 'مشرف (إدارة)' : 'Maintainer (Admin)' },
                { value: 'viewer', label: isRTL ? 'مشاهد (قراءة فقط)' : 'Viewer (Read Only)' },
              ]}
            />
          </Form.Item>

          <Form.Item className="!me-0">
            <Button
              type="primary"
              size="middle"
              htmlType="submit"
              icon={<UserAddOutlined />}
              loading={isAddingMember}
              className={STYLES.primaryAddButton}
            >
              {t('addMemberButton')}
            </Button>
          </Form.Item>
        </Form>

        {/* Members Roster List */}
        <List
          itemLayout="horizontal"
          dataSource={project.memberIds}
          className="divide-y divide-[#DDDAD3] dark:divide-[#2C2824]"
          renderItem={(mId) => (
            <MemberRow
              key={mId}
              memberId={mId}
              project={project}
              currentUserId={user?.uid}
              t={t}
              onRemoveMember={handleRemoveMember}
              onUpdateRole={handleUpdateMemberRole}
            />
          )}
        />
      </Card>

      {/* Danger Zone: Cascade Project Deletion */}
      <Card variant="outlined" className={STYLES.dangerCard}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">
              {t('dangerZoneTitle')}
            </h4>
            <p className="text-xs text-[#5A5348] dark:text-[#B5AC9C] max-w-lg leading-relaxed">
              {t('dangerZoneDesc')}
            </p>
          </div>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="tactile-btn font-bold shrink-0 rounded"
          >
            {t('deleteProjectAction')}
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteDialogOpen}
        projectName={project.name}
        confirmName={confirmDeleteName}
        isDeleting={isDeletingProject}
        t={t}
        onConfirmNameChange={setConfirmDeleteName}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setConfirmDeleteName('');
        }}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
