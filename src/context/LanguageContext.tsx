'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TaskStatus, TaskPriority } from '@/types';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export const translations = {
  en: {
    // Brand & Nav
    appName: 'TaskFlow',
    dashboard: 'Dashboard',
    newProject: 'New Project',
    searchPlaceholder: 'Search...',
    sqlLive: 'SQL Live',
    sqlOffline: 'Offline',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    signOut: 'Sign Out',
    owner: 'Owner',
    member: 'Member',
    languageName: 'العربية',
    switchLanguage: 'Switch to Arabic',

    // Dashboard
    workspaceOverview: 'Workspace Overview',
    signedInAs: 'Signed in as',
    activeProjects: 'Active Projects',
    accessibleWorkspaces: 'Accessible workspaces',
    totalTasks: 'Total Tasks',
    completed: 'completed',
    inProgress: 'In Progress',
    pendingInQueue: 'pending in queue',
    overdueTasks: 'Overdue Tasks',
    requiresAttention: 'Requires attention',
    deadlinesOnTrack: 'Deadlines on track',
    sprintVelocity: 'Sprint Velocity & Completion Rate',
    progress: 'Progress',
    velocitySubtext: 'tasks completed across all active projects',
    yourAccessibleProjects: 'Your Accessible Projects',
    projectsSubtitle: 'Projects where you are the Owner or an Assigned Member',
    filterProjects: 'Filter projects...',
    noMatchingProjects: 'No matching projects found',
    adjustSearch: 'Try adjusting your search query or reset filter',
    clearFilter: 'Clear Filter',
    membersCount: 'members',
    memberSingular: 'member',
    updated: 'Updated',
    openKanban: 'View Project',
    noProjectDescription: 'No description provided.',

    // Dashboard Launchpad (0 projects)
    workspaceInitialized: 'Workspace Initialized',
    welcomeTitle: 'Welcome to TaskFlow',
    welcomeSubtitle:
      'Your pure SQL workspace is configured and ready. Choose a production-tested template below to launch your first sprint board, or initialize an empty workspace with custom scope.',
    selectStarterTemplate: 'Select a Starter Template',
    orBuildFromScratch: 'or build from scratch',
    engineeringSprint: 'Engineering Sprint',
    sprintDesc: '3-column Kanban workflow with drag & drop, priority weights, and sprint velocity tracking.',
    sprintFeat1: 'To Do, In Progress, Done lanes',
    sprintFeat2: 'Priority flags (Urgent, High, Normal)',
    sprintFeat3: 'Team member task assignment',
    useSprintTemplate: 'Use Sprint Template',
    productRoadmap: 'Product & UX Roadmap',
    roadmapDesc: 'Quarterly release initiatives, design token reviews, and cross-functional user feedback.',
    roadmapFeat1: 'Design system token & RFC specs',
    roadmapFeat2: 'Target due dates & milestone tags',
    roadmapFeat3: 'Cross-team collaborator visibility',
    useRoadmapTemplate: 'Use Roadmap Template',
    architectureTriage: 'Architecture & Bug Triage',
    triageDesc: 'Database migrations, RFC-9457 error contracts, security audits, and SLA regression tracking.',
    triageFeat1: 'SQLite WAL schema migrations',
    triageFeat2: 'Overdue task highlighting & alerts',
    triageFeat3: 'Relational cascading integrity',
    useTriageTemplate: 'Use Triage Template',
    pureRelationalArchitecture: 'Pure Relational Architecture Active',
    zeroVendorLockin:
      'Zero third-party vendor lock-in. ACID transactions and cascading deletes enforced via SQLite WAL on port 5001.',
    initCustomProject: 'Initialize Custom Project',

    // New Project Flow
    quickStartTemplates: 'Quick-Start Templates (Optional)',
    clearTemplate: 'Clear Template',
    initProjectWorkspace: 'Initialize Project Workspace',
    ownerAuthorityGrant: 'You will be granted Project Owner authority',
    governanceCallout:
      'Project Owners have exclusive rights to invite collaborators, edit project settings, and manage sprint milestones. Associated tasks and member bindings are maintained under relational SQL ACID guarantees.',
    projectNameLabel: 'Project Name',
    projectNameExtra: '3 to 80 characters required',
    suggestions: 'Suggestions:',
    objectivesScopeLabel: 'Objectives & Scope (Optional)',
    objectivesExtra: 'Up to 1000 characters',
    objectivesPlaceholder: 'Outline deliverables, architectural targets, and sprint dependencies...',
    cancel: 'Cancel',
    initWorkspaceBtn: 'Initialize Workspace',

    // Project Details & Kanban
    kanbanBoard: 'Task Board',
    tableView: 'Table View',
    filterTasksPlaceholder: 'Filter tasks by title...',
    overdueFilter: 'Overdue',
    myTasksFilter: 'My Tasks',
    allStatus: 'All Status',
    allPriority: 'All Priority',
    allMembers: 'All Members',
    unassigned: 'Unassigned',
    sortDefault: 'Sort: Default',
    sortPriority: 'Sort: Priority',
    sortDueDate: 'Sort: Due Date',
    sortTitle: 'Sort: Title (A-Z)',
    resetFilters: 'Reset',
    addTask: 'Add Task',
    settings: 'Settings',
    teamRoster: 'Team Roster',
    noTasksInQueue: 'No tasks in queue',
    noTasksInProgress: 'No tasks in progress',
    noTasksCompleted: 'No completed tasks yet',
    dropHereToMove: 'Drop here to move to',
    overdueBadge: 'OVERDUE',

    // Task Statuses
    statusTodo: 'To Do',
    statusInProgress: 'In Progress',
    statusDone: 'Done',

    // Task Priorities
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    priorityUrgent: 'Urgent',

    // Task Card Actions
    startAction: 'Start',
    reopenAction: 'Reopen',
    doneAction: 'Done',
    deleteAction: 'Delete',
    editAction: 'Edit',

    // Task Modal
    createTaskTitle: 'Create New Task',
    editTaskTitle: 'Edit Task Specifications',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'e.g. Build authentication middleware with RFC 9457 errors',
    taskDescLabel: 'Description & Acceptance Criteria (Optional)',
    taskDescPlaceholder: 'Outline technical requirements, API contracts, or deliverables...',
    initialStatusLabel: 'Initial Status',
    priorityLevelLabel: 'Priority Level',
    assigneeLabel: 'Assignee (Team Member)',
    targetDueDateLabel: 'Target Due Date',
    pressCmdEnter: 'Press Cmd+Enter to save',
    saveChanges: 'Save Changes',
    createTaskBtn: 'Create Task',

    // Task Inspection Drawer
    taskDetails: 'Task Details',
    assignedToPrefix: 'Assigned to',
    description: 'Description',
    noDescriptionProvided: 'No description provided for this task.',
    createdByPrefix: 'Created by:',
    createdOnPrefix: 'Created on:',
    lastUpdatedPrefix: 'Last updated:',
    markAsDone: 'Mark as Done',
    reopenTask: 'Reopen Task',
    deleteTaskConfirmTitle: 'Delete Task',
    deleteTaskConfirmDesc: 'Are you sure you want to delete this task?',

    // Table Columns
    colKey: 'Key',
    colTitle: 'Title',
    colStatus: 'Status',
    colPriority: 'Priority',
    colAssignee: 'Assignee',
    colDueDate: 'Due Date',
    colActions: 'Actions',

    // Relative Dates
    today: 'Today',
    tomorrow: 'Tomorrow',
    recently: 'Recently',

    // Team Roster Modal
    teamRosterSubtitle: 'Project Team Roster & Roles',
    filterAll: 'All',
    filterLeaders: 'Leaders',
    filterMembers: 'Members',
    searchMembersPlaceholder: 'Search by name or email...',
    noMembersMatch: 'No team members match your filter criteria.',
    projectLead: 'Project Lead',
    youBadge: 'You',
    noEmailRegistered: 'No email registered',
    closeBtn: 'Close',
    leadersCountSuffix: 'Leader',
    leadersCountSuffixPlural: 'Leaders',
    membersCountSuffix: 'Member',
    membersCountSuffixPlural: 'Members',

    // Project Settings
    projectSettingsTitle: 'Project Settings',
    projectSettingsSubtitle: 'Manage project metadata, team membership, and administrative controls',
    backToProject: 'Back to',
    generalInformation: 'General Information',
    saveProjectSettings: 'Save Changes',
    projectUpdatedSuccess: 'Project details updated successfully',
    teamMembersSection: 'Team Members',
    addMemberDesc: 'Add registered team members by email to grant them project and task access.',
    memberEmailPlaceholder: 'e.g. member@example.test',
    addMemberBtn: 'Add Member',
    memberAddedSuccess: 'User added to project!',
    removeMemberConfirmTitle: 'Remove Member',
    removeMemberConfirmDesc: 'Revoke future project access for this user?',
    yesRemove: 'Yes, Remove',
    memberRemovedSuccess: 'Member removed from project',
    dangerZone: 'Danger Zone',
    deleteThisProject: 'Delete This Project',
    deleteProjectWarning: 'Permanently deletes the project and clears all associated tasks. This action cannot be undone.',
    deleteProjectBtn: 'Delete Project',
    confirmDeletionTitle: 'Confirm Permanent Deletion',
    confirmDeletionPrompt: 'Please type the exact project name to confirm:',
    typeProjectNamePlaceholder: 'Type project name here...',
    confirmDeleteBtn: 'Confirm Delete',
    projectDeletedSuccess: 'Project permanently deleted',
  },
  ar: {
    // Brand & Nav
    appName: 'تاسك فلو',
    dashboard: 'لوحة التحكم',
    newProject: 'مشروع جديد',
    searchPlaceholder: 'بحث سريع...',
    sqlLive: 'قاعدة البيانات نشطة',
    sqlOffline: 'غير متصل',
    signIn: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
    signOut: 'تسجيل الخروج',
    owner: 'المالك',
    member: 'عضو',
    languageName: 'English',
    switchLanguage: 'التحويل إلى الإنجليزية',

    // Dashboard
    workspaceOverview: 'نظرة عامة على مساحة العمل',
    signedInAs: 'تم تسجيل الدخول باسم',
    activeProjects: 'المشاريع النشطة',
    accessibleWorkspaces: 'مساحات العمل المتاحة',
    totalTasks: 'إجمالي المهام',
    completed: 'مكتملة',
    inProgress: 'قيد التنفيذ',
    pendingInQueue: 'في قائمة الانتظار',
    overdueTasks: 'المهام المتأخرة',
    requiresAttention: 'تتطلب الانتباه فوراً',
    deadlinesOnTrack: 'المواعيد منتظمة تماماً',
    sprintVelocity: 'سرعة الإنجاز ومعدل الاكتمال',
    progress: 'نسبة التقدم',
    velocitySubtext: 'مهام تم إنجازها عبر جميع المشاريع النشطة',
    yourAccessibleProjects: 'المشاريع المتاحة لك',
    projectsSubtitle: 'المشاريع التي تمتلك صلاحية المالك فيها أو تم تعيينك كعضو فريق',
    filterProjects: 'تصفية المشاريع...',
    noMatchingProjects: 'لم يتم العثور على مشاريع مطابقة',
    adjustSearch: 'جرّب تعديل كلمة البحث أو إلغاء التصفية',
    clearFilter: 'إلغاء التصفية',
    membersCount: 'أعضاء',
    memberSingular: 'عضو',
    updated: 'تم التحديث',
    openKanban: 'عرض المشروع',
    noProjectDescription: 'لا يوجد وصف متاح للمشروع.',

    // Dashboard Launchpad (0 projects)
    workspaceInitialized: 'تم تهيئة مساحة العمل',
    welcomeTitle: 'مرحباً بك في TaskFlow',
    welcomeSubtitle:
      'مساحة العمل المتصلة بمحرك SQL النقي جاهزة تماماً للإنتاج. اختر قالباً مجرباً لبدء أول لوحة سبرنت، أو أنشئ مساحة عمل فارغة بمواصفاتك المخصصة.',
    selectStarterTemplate: 'اختر قالباً جاهزاً للبدء',
    orBuildFromScratch: 'أو ابدأ من الصفر',
    engineeringSprint: 'سبرنت هندسي برمجى',
    sprintDesc: 'سير عمل كانبان من 3 أعمدة مع السحب والإفلات وتحديد الأولويات ومتابعة سرعة الإنجاز.',
    sprintFeat1: 'أعمدة: قيد الانتظار، قيد التنفيذ، ومكتمل',
    sprintFeat2: 'أولويات صريحة (عاجل، عالي، عادي)',
    sprintFeat3: 'تعيين مباشر لأعضاء الفريق',
    useSprintTemplate: 'استخدم قالب السبرنت',
    productRoadmap: 'خارطة طريق المنتج وتجربة المستخدم',
    roadmapDesc: 'مبادرات الإطلاق الفصلية، مراجعة توكنز التصميم، وتوثيق آراء المستخدمين.',
    roadmapFeat1: 'مراجعة توكنز نظام التصميم ومواصفات RFC',
    roadmapFeat2: 'مواعيد استحقاق مستهدفة ومحطات تسليم',
    roadmapFeat3: 'رؤية واضحة للتعاون بين الفرق',
    useRoadmapTemplate: 'استخدم قالب خارطة الطريق',
    architectureTriage: 'إدارة البنية ومعالجة الأخطاء',
    triageDesc: 'ترحيل قواعد البيانات، عقود أخطاء RFC-9457، تدقيق الأمان وتتبع معايير SLA.',
    triageFeat1: 'ترحيل مخططات قواعد بيانات SQLite WAL',
    triageFeat2: 'إبراز وتنبيه بالمهام المتأخرة فوراً',
    triageFeat3: 'ضمان التكامل التسلسلي العلائقي SQL',
    useTriageTemplate: 'استخدم قالب معالجة الأخطاء',
    pureRelationalArchitecture: 'البنية العلائقية النقية نشطة',
    zeroVendorLockin:
      'بدون أي قيود أو تبعيات سحابية خارجية. معاملات ACID متكاملة وحذف تسلسلي عبر SQLite WAL على المنفذ 5001.',
    initCustomProject: 'تهيئة مشروع مخصص',

    // New Project Flow
    quickStartTemplates: 'قوالب سريعة للبدء (اختياري)',
    clearTemplate: 'إلغاء تحديد القالب',
    initProjectWorkspace: 'تهيئة مساحة عمل المشروع',
    ownerAuthorityGrant: 'ستحصل على كامل صلاحيات مالك المشروع (Owner)',
    governanceCallout:
      'يمتلك مالك المشروع الصلاحيات الحصرية لدعوة الأعضاء، تعديل الإعدادات، وإدارة محطات الإنجاز مع ضمانات SQL العلائقية وموثوقية ACID.',
    projectNameLabel: 'اسم المشروع',
    projectNameExtra: 'مطلوب من 3 إلى 80 حرفاً',
    suggestions: 'اقتراحات:',
    objectivesScopeLabel: 'الأهداف ونطاق العمل (اختياري)',
    objectivesExtra: 'بحد أقصى 1000 حرف',
    objectivesPlaceholder: 'حدد المخرجات والأهداف المعمارية ومتطلبات السبرنت...',
    cancel: 'إلغاء',
    initWorkspaceBtn: 'تهيئة مساحة العمل',

    // Project Details & Kanban
    kanbanBoard: 'لوحة المهام',
    tableView: 'عرض الجدول',
    filterTasksPlaceholder: 'تصفية المهام بالاسم...',
    overdueFilter: 'المتأخرة',
    myTasksFilter: 'مهامي',
    allStatus: 'كافة الحالات',
    allPriority: 'كافة الأولويات',
    allMembers: 'كافة الأعضاء',
    unassigned: 'غير معين',
    sortDefault: 'الترتيب: الافتراضي',
    sortPriority: 'الترتيب: الأولوية',
    sortDueDate: 'الترتيب: تاريخ الاستحقاق',
    sortTitle: 'الترتيب: العنوان (أ-ي)',
    resetFilters: 'إعادة ضبط',
    addTask: 'إضافة مهمة',
    settings: 'الإعدادات',
    teamRoster: 'فريق العمل',
    noTasksInQueue: 'لا توجد مهام في قائمة الانتظار',
    noTasksInProgress: 'لا توجد مهام قيد التنفيذ حالياً',
    noTasksCompleted: 'لا توجد مهام مكتملة بعد',
    dropHereToMove: 'أفلت هنا للنقل إلى',
    overdueBadge: 'متأخرة',

    // Task Statuses
    statusTodo: 'قيد الانتظار',
    statusInProgress: 'قيد التنفيذ',
    statusDone: 'مكتملة',

    // Task Priorities
    priorityLow: 'منخفض',
    priorityMedium: 'متوسط',
    priorityHigh: 'عالي',
    priorityUrgent: 'عاجل',

    // Task Card Actions
    startAction: 'بدء',
    reopenAction: 'إعادة فتح',
    doneAction: 'إكمال',
    deleteAction: 'حذف',
    editAction: 'تعديل',

    // Task Modal
    createTaskTitle: 'إنشاء مهمة جديدة',
    editTaskTitle: 'تعديل مواصفات المهمة',
    taskTitleLabel: 'عنوان المهمة',
    taskTitlePlaceholder: 'مثال: بناء وسيط المصادقة مع عقود أخطاء RFC 9457',
    taskDescLabel: 'الوصف ومعايير القبول (اختياري)',
    taskDescPlaceholder: 'حدد المتطلبات التقنية، عقود واجهة الـ API، أو المخرجات المستهدفة...',
    initialStatusLabel: 'الحالة الأولية',
    priorityLevelLabel: 'مستوى الأولوية',
    assigneeLabel: 'المسؤول (عضو الفريق)',
    targetDueDateLabel: 'تاريخ الاستحقاق المستهدف',
    pressCmdEnter: 'اضغط Cmd+Enter للحفظ السريع',
    saveChanges: 'حفظ التعديلات',
    createTaskBtn: 'إنشاء المهمة',

    // Task Inspection Drawer
    taskDetails: 'تفاصيل المهمة',
    assignedToPrefix: 'معينة لـ',
    description: 'الوصف',
    noDescriptionProvided: 'لم يتم تقديم وصف تفصيلي لهذه المهمة بعد.',
    createdByPrefix: 'أنشئت بواسطة:',
    createdOnPrefix: 'تاريخ الإنشاء:',
    lastUpdatedPrefix: 'آخر تحديث:',
    markAsDone: 'تحديد كمكتمل',
    reopenTask: 'إعادة فتح المهمة',
    deleteTaskConfirmTitle: 'حذف المهمة',
    deleteTaskConfirmDesc: 'هل أنت متأكد من رغبتك في حذف هذه المهمة نهائياً؟',

    // Table Columns
    colKey: 'الرمز',
    colTitle: 'العنوان',
    colStatus: 'الحالة',
    colPriority: 'الأولوية',
    colAssignee: 'المسؤول',
    colDueDate: 'تاريخ الاستحقاق',
    colActions: 'الإجراءات',

    // Relative Dates
    today: 'اليوم',
    tomorrow: 'غداً',
    recently: 'مؤخراً',

    // Team Roster Modal
    teamRosterSubtitle: 'قائمة أعضاء وأدوار المشروع',
    filterAll: 'الكل',
    filterLeaders: 'القادة',
    filterMembers: 'الأعضاء',
    searchMembersPlaceholder: 'البحث بالاسم أو البريد...',
    noMembersMatch: 'لا يوجد أعضاء يطابقون معايير البحث.',
    projectLead: 'قائد المشروع',
    youBadge: 'أنت',
    noEmailRegistered: 'لا يوجد بريد مسجل',
    closeBtn: 'إغلاق',
    leadersCountSuffix: 'قائد',
    leadersCountSuffixPlural: 'قادة',
    membersCountSuffix: 'عضو',
    membersCountSuffixPlural: 'أعضاء',

    // Project Settings
    projectSettingsTitle: 'إعدادات المشروع',
    projectSettingsSubtitle: 'إدارة البيانات الوصفية، وعضوية الفريق، وعناصر التحكم الإدارية',
    backToProject: 'العودة إلى',
    generalInformation: 'المعلومات العامة',
    saveProjectSettings: 'حفظ التعديلات',
    projectUpdatedSuccess: 'تم تحديث تفاصيل المشروع بنجاح',
    teamMembersSection: 'أعضاء الفريق',
    addMemberDesc: 'أضف أعضاء الفريق المسجلين عبر البريد الإلكتروني لمنحهم صلاحية الوصول إلى المشروع والمهام.',
    memberEmailPlaceholder: 'مثال: member@example.test',
    addMemberBtn: 'إضافة عضو',
    memberAddedSuccess: 'تمت إضافة العضو إلى المشروع بنجاح!',
    removeMemberConfirmTitle: 'إزالة عضو',
    removeMemberConfirmDesc: 'هل تريد إلغاء صلاحية الوصول إلى المشروع لهذا العضو؟',
    yesRemove: 'نعم، إزالة',
    memberRemovedSuccess: 'تمت إزالة العضو من المشروع بنجاح',
    dangerZone: 'منطقة الخطر',
    deleteThisProject: 'حذف هذا المشروع',
    deleteProjectWarning: 'سيتم حذف المشروع نهائياً ومسح جميع المهام المرتبطة به. لا يمكن التراجع عن هذا الإجراء.',
    deleteProjectBtn: 'حذف المشروع',
    confirmDeletionTitle: 'تأكيد الحذف النهائي',
    confirmDeletionPrompt: 'يرجى كتابة اسم المشروع بدقة للتأكيد:',
    typeProjectNamePlaceholder: 'اكتب اسم المشروع هنا...',
    confirmDeleteBtn: 'تأكيد الحذف',
    projectDeletedSuccess: 'تم حذف المشروع نهائياً',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  formatTaskStatus: (status: TaskStatus) => string;
  formatTaskPriority: (priority: TaskPriority | string) => string;
  formatDateLocalized: (dateVal: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('tf_lang') as Language;
    if (saved === 'en' || saved === 'ar') {
      setLanguageState(saved);
      applyLanguage(saved);
    } else {
      // Default to English, but detect browser if Arabic
      const browserLang = navigator.language?.startsWith('ar') ? 'ar' : 'en';
      setLanguageState(browserLang);
      applyLanguage(browserLang);
    }
  }, []);

  const applyLanguage = (lang: Language) => {
    const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', dir);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tf_lang', lang);
    applyLanguage(lang);
  };

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const formatTaskStatus = (status: TaskStatus): string => {
    if (status === 'todo') return language === 'ar' ? 'قيد الانتظار' : 'To Do';
    if (status === 'in_progress') return language === 'ar' ? 'قيد التنفيذ' : 'In Progress';
    if (status === 'done') return language === 'ar' ? 'مكتمل' : 'Done';
    return status;
  };

  const formatTaskPriority = (priority: TaskPriority | string): string => {
    const p = priority.toLowerCase();
    if (p === 'urgent') return language === 'ar' ? 'عاجل' : 'Urgent';
    if (p === 'high') return language === 'ar' ? 'عالي' : 'High';
    if (p === 'medium') return language === 'ar' ? 'متوسط' : 'Medium';
    if (p === 'low') return language === 'ar' ? 'منخفض' : 'Low';
    return priority;
  };

  const formatDateLocalized = (dateVal: any): string => {
    if (!dateVal) return t('recently');
    try {
      let d: Date;
      if (typeof dateVal.toDate === 'function') {
        d = dateVal.toDate();
      } else if (typeof dateVal.seconds === 'number') {
        d = new Date(dateVal.seconds * 1000);
      } else if (typeof dateVal === 'string') {
        const parts = dateVal.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          d = new Date(dateVal);
        }
      } else if (dateVal instanceof Date) {
        d = dateVal;
      } else if (typeof dateVal === 'number') {
        d = new Date(dateVal);
      } else {
        return t('recently');
      }

      if (isNaN(d.getTime())) return t('recently');

      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      return d.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return t('recently');
    }
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        toggleLanguage,
        t,
        formatTaskStatus,
        formatTaskPriority,
        formatDateLocalized,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
