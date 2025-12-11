<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { ElButton, ElCard } from 'element-plus';

const router = useRouter();
</script>

<template>
  <div class="p-6">
    <ElCard header="新增案件" size="small">
      <div class="flex h-64 flex-col items-center justify-center">
        <h2 class="mb-4 text-2xl font-bold text-gray-500">案件新增功能</h2>
        <p class="mb-6 text-gray-400">该功能正在开发中，敬请期待</p>
        <ElButton type="primary" @click="router.back()">返回</ElButton>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
/* 可以添加自定义样式 */
</style>
