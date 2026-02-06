import type { RouteRecordRaw } from 'vue-router';

const DocumentTemplatesRoute: RouteRecordRaw = {
  path: 'document-templates',
  name: 'DocumentTemplates',
  component: () => import('#/views/dashboard/document-templates/index.vue'),
  meta: {
    title: '文档模板管理',
    icon: 'Document',
    requiresAuth: true,
    order: 30,
  },
};

export default DocumentTemplatesRoute;