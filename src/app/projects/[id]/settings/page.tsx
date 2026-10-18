'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataStore';
import { Project } from '@/types';
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
  UserOutlined,
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
  Typography,
  message,
  Spin,
} from 'antd';
import { useLanguage } from '@/context/LanguageContext';

const { Title, Text, Paragraph } = Typography;

export default function ProjectSettingsPage() {
  const { t, isRTL } = useLanguage();
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projectForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // General Update
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Member
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Delete Project Modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && projectId) {
      loadProject();
    }
  }, [user, authLoading, projectId]);

  const loadProject = async () => {
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
  };

  useEffect(() => {
    if (project) {
      projectForm.setFieldsValue({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [project, projectForm]);

  const handleUpdateGeneral = async (values: any) => {
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

  const handleAddMember = async (values: any) => {
    if (!user || !project) return;
    const email = values.email.trim();

    try {
      setIsAddingMember(true);
      const updated = await DataService.addProjectMember(projectId, email, user.uid);
      setProject(updated);
      memberForm.resetFields();
      message.success(t('memberAddedSuccess'));
    } catch (err: any) {
      message.error(err?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
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

  if (loading || authLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-[#161c26] rounded" />
          <div className="h-8 w-56 bg-slate-300 dark:bg-[#1e2636] rounded-lg" />
        </div>
        <Card variant="outlined" className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] p-4 space-y-4">
          <div className="h-4 w-40 bg-slate-200 dark:bg-[#1a2230] rounded mb-3" />
          <div className="h-10 w-full bg-slate-100 dark:bg-[#161c26] rounded-lg" />
          <div className="h-20 w-full bg-slate-100 dark:bg-[#161c26] rounded-lg" />
        </Card>
      </div>
    );
  }

  if (error && error.includes('UNAUTHORIZED')) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 mt-8">
        <ExclamationCircleOutlined className="text-3xl text-red-500 mb-3" />
        <Title level={4}>Access Denied</Title>
        <Text type="secondary" className="block mb-6">
          Only the Project Owner has permission to manage project settings and membership.
        </Text>
        <Link href={`/projects/${projectId}`}>
          <Button type="primary" icon={<ArrowLeftOutlined />}>Return to Project</Button>
        </Link>
      </Card>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Back Link & Header */}
      <div>
        <Link href={`/projects/${project.id}`}>
          <Button type="link" icon={<ArrowLeftOutlined />} className="!px-0 mb-2">
            {t('backToProject')} {project.name}
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <SettingOutlined className="text-2xl text-blue-600" />
          <div>
            <Title level={2} className="!mb-0 !text-2xl !font-bold">
              {t('projectSettingsTitle')}
            </Title>
            <Text type="secondary" className="text-xs">
              {t('projectSettingsSubtitle')}
            </Text>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <Card
        title={<span className="font-bold text-slate-900 dark:text-slate-100">{t('generalInformation')}</span>}
        variant="outlined"
        className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none"
      >
        <Form form={projectForm} layout="vertical" onFinish={handleUpdateGeneral} requiredMark="optional">
          <Form.Item
            name="name"
            label={<span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('projectNameLabel')}</span>}
            rules={[
              { required: true, message: 'Please enter a project name' },
              { min: 3, message: 'Minimum 3 characters' },
              { max: 80, message: 'Maximum 80 characters' },
            ]}
          >
            <Input showCount maxLength={80} size="large" dir="auto" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('objectivesScopeLabel')}</span>}
            rules={[{ max: 1000, message: 'Max 1000 characters' }]}
          >
            <Input.TextArea showCount maxLength={1000} rows={3} dir="auto" />
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={isUpdating} className="!bg-blue-600 !border-blue-600 text-white">
              {t('saveProjectSettings')}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Team Membership Management */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{t('teamMembersSection')} ({project.memberIds.length})</span>
          </div>
        }
        variant="outlined"
        className="border-slate-200 dark:border-[#1e2430] bg-white dark:bg-[#12161f] shadow-none"
      >
        <Paragraph className="text-xs text-slate-500 !mb-4">
          {t('addMemberDesc')}
        </Paragraph>

        {/* Add Member Form */}
        <Form form={memberForm} layout="inline" onFinish={handleAddMember} className="mb-6">
          <Form.Item
            name="email"
            className="flex-1"
            rules={[
              { required: true, message: 'Enter member email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-slate-400" />}
              placeholder={t('memberEmailPlaceholder')}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} loading={isAddingMember} className="!bg-blue-600 !border-blue-600 text-white">
              {t('addMemberBtn')}
            </Button>
          </Form.Item>
        </Form>

        {/* Member Roster List */}
        <List
          itemLayout="horizontal"
          dataSource={project.memberIds}
          renderItem={(mId) => {
            const member = project.memberDetails?.[mId];
            const isOwnerMember = mId === project.ownerId;

            return (
              <List.Item
                actions={[
                  !isOwnerMember ? (
                    <Popconfirm
                      key="remove"
                      title={t('removeMemberConfirmTitle')}
                      description={t('removeMemberConfirmDesc')}
                      onConfirm={() => handleRemoveMember(mId)}
                      okText={t('yesRemove')}
                      cancelText={t('cancel')}
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" danger icon={<UserDeleteOutlined />} size="small">
                        {t('deleteAction')}
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Tag key="owner-badge" className="m-0 text-[11px] border-slate-200 dark:border-[#1e2430] bg-slate-50 dark:bg-[#171c26] text-amber-600 dark:text-amber-400">
                      {t('owner')}
                    </Tag>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />} className={isOwnerMember ? 'bg-amber-600' : 'bg-slate-400'}>
                      {member?.displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <span dir="auto" className="font-semibold text-xs sm:text-sm">
                      {member?.displayName || mId}
                    </span>
                  }
                  description={
                    <span className="text-xs text-slate-400">
                      {member?.email || 'Registered User'}
                    </span>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Danger Zone: Project Deletion */}
      <Card
        title={
          <span className="text-rose-600 font-bold flex items-center gap-2">
            <DeleteOutlined /> {t('dangerZone')}
          </span>
        }
        variant="outlined"
        className="border-rose-300 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-none"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              {t('deleteThisProject')}
            </div>
            <div className="text-xs text-slate-500">
              {t('deleteProjectWarning')}
            </div>
          </div>
          <Button danger type="primary" onClick={() => setIsDeleteDialogOpen(true)}>
            {t('deleteProjectBtn')}
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('confirmDeletionTitle')}
        open={isDeleteDialogOpen}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setConfirmDeleteName('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteDialogOpen(false)}>
            {t('cancel')}
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            loading={isDeletingProject}
            disabled={confirmDeleteName.trim() !== project.name.trim()}
            onClick={handleDeleteProject}
          >
            {t('confirmDeleteBtn')}
          </Button>,
        ]}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          {t('confirmDeletionPrompt')}{' '}
          <strong dir="auto" className="text-slate-900 dark:white font-mono select-all">
            &quot;{project.name}&quot;
          </strong>
        </p>
        <Input
          placeholder={t('typeProjectNamePlaceholder')}
          value={confirmDeleteName}
          onChange={(e) => setConfirmDeleteName(e.target.value)}
          dir="auto"
        />
      </Modal>
    </div>
  );
}
