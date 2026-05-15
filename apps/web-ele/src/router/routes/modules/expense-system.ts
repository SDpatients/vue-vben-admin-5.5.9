import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:wallet',
      order: 3,
      title: $t('page.expenseSystem.title'),
      roles: ['USER'],
    },
    name: 'ExpenseSystem',
    path: '/expense-system',
    children: [
      {
        name: 'ExpenseReimbursement',
        path: 'expense-reimbursement',
        redirect: '/expense-system/expense-reimbursement/list',
        meta: {
          icon: 'lucide:receipt',
          title: $t('page.expenseSystem.expenseManagement'),
        },
        children: [
          {
            name: 'ExpenseReimbursementList',
            path: 'list',
            component: () => import('#/views/expense-reimbursement/index.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:list',
              title: $t('page.expenseSystem.reimbursementList'),
            },
          },
          {
            name: 'ExpenseReimbursementAdd',
            path: 'add',
            component: () => import('#/views/expense-reimbursement/form.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:plus',
              title: '新增报销单',
              hideInMenu: true,
              hideInTab: true,
            },
          },
          {
            name: 'ExpenseReimbursementDetail',
            path: 'detail/:id',
            component: () => import('#/views/expense-reimbursement/detail.vue'),
            meta: {
              affixTab: false,
              icon: 'lucide:file-text',
              title: '报销单详情',
              hideInMenu: true,
              hideInTab: true,
            },
          },
        ],
      },
      {
        name: 'TemplateManagement',
        path: 'template-management',
        component: () => import('#/views/dashboard/template-management/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.expenseSystem.templateManagement'),
        },
      },
      {
        name: 'BackupManagement',
        path: 'backup-management',
        component: () => import('#/views/backup-management/index.vue'),
        meta: {
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
          icon: 'lucide:database-backup',
          title: $t('page.expenseSystem.backupManagement'),
        },
      },
      {
        name: 'UserManagement',
        path: 'user-management',
        redirect: '/expense-system/user-management/list',
        meta: {
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
          icon: 'lucide:user-cog',
          title: $t('page.expenseSystem.userManagement'),
        },
        children: [
          {
            name: 'UserManagementList',
            path: 'list',
            component: () => import('#/views/user-management/index.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:users',
              title: $t('page.expenseSystem.userList'),
            },
          },
          {
            name: 'UserManagementAdd',
            path: 'add',
            component: () => import('#/views/user-management/form.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:user-plus',
              title: $t('page.expenseSystem.userAdd'),
              hideInMenu: true,
              hideInTab: true,
            },
          },
        ],
      },
      {
        name: 'UserProfile',
        path: 'user-profile',
        component: () => import('#/views/user/profile/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-round-pen',
          title: $t('page.expenseSystem.userProfile'),
        },
      },
      {
        name: 'AuditLog',
        path: 'audit-log',
        redirect: '/expense-system/audit-log/list',
        meta: {
          authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
          icon: 'lucide:shield-check',
          title: $t('page.expenseSystem.auditLog'),
        },
        children: [
          {
            name: 'AuditLogList',
            path: 'list',
            component: () => import('#/views/audit-log/index.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:list',
              title: $t('page.expenseSystem.auditLogList'),
            },
          },
          {
            name: 'AuditLogDetail',
            path: 'detail/:id',
            component: () => import('#/views/audit-log/detail.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:file-search',
              title: $t('page.expenseSystem.auditLogDetail'),
              hideInMenu: true,
              hideInTab: true,
            },
          },
          {
            name: 'AuditLogStatistics',
            path: 'statistics',
            component: () => import('#/views/audit-log/statistics.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:bar-chart-3',
              title: $t('page.expenseSystem.auditLogStatistics'),
            },
          },
          {
            name: 'AuditLogIntegrity',
            path: 'integrity',
            component: () => import('#/views/audit-log/integrity.vue'),
            meta: {
              affixTab: false,
              authority: ['ADMIN', '管理员', 'SUPER_ADMIN', '超级管理员'],
              icon: 'lucide:shield-alert',
              title: $t('page.expenseSystem.auditLogIntegrity'),
            },
          },
        ],
      },
    ],
  },
];

export default routes;
