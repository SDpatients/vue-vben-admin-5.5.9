<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { ref } from 'vue';

import { Card, Page } from '@vben/common-ui';

import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'AboutPage' });

declare global {
  const __VBEN_ADMIN_METADATA__: {
    buildTime: string;
    version: string;
  };
}

const version = ref(customerConfig.app.version);
const buildTime = ref(__VBEN_ADMIN_METADATA__?.buildTime || 'Unknown');

const dependencies = [
  { name: 'Vue', version: '3.4.x', license: 'MIT' },
  { name: 'Vue Router', version: '4.3.x', license: 'MIT' },
  { name: 'Pinia', version: '2.1.x', license: 'MIT' },
  { name: 'Element Plus', version: '2.7.x', license: 'MIT' },
  { name: 'Vue Vben Admin', version: '5.5.9', license: 'MIT' },
  { name: 'Tailwind CSS', version: '3.4.x', license: 'MIT' },
  { name: 'Vite', version: '5.2.x', license: 'MIT' },
  { name: 'TypeScript', version: '5.4.x', license: 'Apache-2.0' },
];
</script>

<template>
  <Page description="关于本系统" title="关于">
    <div class="space-y-6">
      <!-- 产品信息 -->
      <Card title="产品信息" class="max-w-6xl mx-auto">  <!-- 为卡片添加最大宽度 -->
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="产品名称">
            {{ customerConfig.app.fullName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版本号">
            {{ version }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="开发公司">
            {{ customerConfig.company.name }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="联系邮箱">
            {{ customerConfig.company.email }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="构建时间" :span="2">
            {{ buildTime }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版权声明" :span="2">
            © {{ customerConfig.copyright.year }} {{ customerConfig.copyright.company }} 版权所有
          </ElDescriptionsItem>
        </ElDescriptions>
      </Card>

      <!-- 开源致谢 -->
      <Card title="开源组件致谢">
        <p class="mb-4 text-sm text-gray-600">
          本系统基于以下优秀的开源项目构建，感谢开源社区的贡献：
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="px-4 py-2 text-left">组件名称</th>
                <th class="px-4 py-2 text-left">版本</th>
                <th class="px-4 py-2 text-left">许可证</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="dep in dependencies"
                :key="dep.name"
                class="border-b"
              >
                <td class="px-4 py-2">{{ dep.name }}</td>
                <td class="px-4 py-2">{{ dep.version }}</td>
                <td class="px-4 py-2">
                  <ElTag size="small" type="info">{{ dep.license }}</ElTag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- 许可证说明 -->
      <Card title="许可证说明">
        <div class="space-y-4 text-sm leading-relaxed">
          <p>
            本系统基于 Vue Vben Admin (MIT License) 开发构建。
            原始框架版权归 Vben 所有 (Copyright (c) 2024-present, Vben)。
          </p>
          <p>
            本系统的修改和扩展部分版权归 {{ customerConfig.copyright.company }} 所有
            (Copyright (c) {{ customerConfig.copyright.year }}-present, {{ customerConfig.copyright.company }})。
          </p>
          <p>
            根据 MIT 许可证的要求，原始框架的版权声明和许可文本已包含在项目的
            LICENSE 文件中。
          </p>
          <div class="mt-4 rounded bg-gray-50 p-4">
            <p class="font-medium">MIT License 摘要：</p>
            <ul class="mt-2 list-inside list-disc space-y-1 text-gray-600">
              <li>允许商业使用</li>
              <li>允许修改和分发</li>
              <li>允许私人使用</li>
              <li>必须包含原始版权声明和许可文本</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>
