<script lang="ts" setup>
/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Card, Page } from '@vben/common-ui';

import { ElButton, ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';

import { customerConfig } from '#/customer.config';

defineOptions({ name: 'AboutPage' });

const router = useRouter();

declare global {
  const __VBEN_ADMIN_METADATA__: {
    buildTime: string;
    version: string;
  };
}

const version = ref(customerConfig.app.version);
const buildTime = ref(__VBEN_ADMIN_METADATA__?.buildTime || '未知');

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

function goToProductIntro() {
  router.push('/about-us/product-intro');
}
</script>

<template>
  <Page description="关于本系统" title="关于">
    <div class="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <!-- 产品介绍快捷入口 -->
      <Card class="border-blue-100 bg-blue-50/50 p-6">
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">想了解系统功能？</h3>
            <p class="mt-1 text-sm text-gray-600">查看完整的产品介绍文档，包含系统架构、功能模块、破产流程等详细信息</p>
          </div>
          <ElButton type="primary" size="large" @click="goToProductIntro">
            查看产品介绍 →
          </ElButton>
        </div>
      </Card>

      <!-- 产品信息 -->
      <Card title="产品信息" class="p-6">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="产品名称">
            {{ customerConfig.app.fullName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版本号">
            <ElTag size="large" type="primary">{{ version }}</ElTag>
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
      <Card title="开源组件致谢" class="p-6">
        <p class="mb-4 text-base text-gray-600">
          本系统基于以下优秀的开源项目构建，感谢开源社区的贡献：
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-base">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="px-4 py-3 text-left font-semibold text-gray-700">组件名称</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">版本</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">许可证</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="dep in dependencies"
                :key="dep.name"
                class="border-b hover:bg-gray-50"
              >
                <td class="px-4 py-3">{{ dep.name }}</td>
                <td class="px-4 py-3">{{ dep.version }}</td>
                <td class="px-4 py-3">
                  <ElTag size="small" type="info">{{ dep.license }}</ElTag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- 许可证说明 -->
      <Card title="许可证说明" class="p-6">
        <div class="space-y-4 text-base leading-relaxed text-gray-700">
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
          <div class="mt-6 rounded-lg bg-gray-50 p-6">
            <h4 class="mb-4 font-semibold text-gray-800">MIT License 摘要：</h4>
            <ul class="mt-2 ml-6 list-disc space-y-2 text-gray-600">
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
