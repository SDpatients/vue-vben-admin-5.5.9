import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:file-text',
      order: 10,
      title: 'OnlyOffice模板测试',
      roles: ['USER'],
    },
    name: 'OnlyOfficeTemplate',
    path: '/onlyoffice-template',
    children: [
      {
        name: 'OnlyOfficeTemplateTest',
        path: 'test',
        component: () => import('#/views/onlyoffice-template-test/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-edit',
          title: 'OnlyOffice模板测试',
        },
      },
    ],
  },
];

export default routes;
