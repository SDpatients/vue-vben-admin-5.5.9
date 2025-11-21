<script lang="ts" setup>
import {
  ElAlert,
  ElButton,
  ElCard,
  ElCol,
  ElMessage,
  ElRow,
  ElSpace,
  ElTag,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

const handleRefresh = () => {
  ElMessage.success('页面已刷新');
};

const handleAddCase = () => {
  ElMessage.info('打开添加案件对话框');
};

const handleSearchLaw = () => {
  ElMessage.info('执行法律检索操作');
};

const handleGenerateReport = () => {
  ElMessage.success('报告生成成功');
};
</script>

<template>
  <div class="p-6">
    <ElCard header="法律模块测试页面" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span>法律模块测试页面</span>
          <ElButton type="primary" @click="handleRefresh">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <ElSpace direction="vertical" size="large" class="w-full">
        <ElAlert type="info" title="欢迎使用法律模块" show-icon>
          这是一个法律相关的测试页面，用于演示如何在Vue Vben
          Admin项目中添加新的功能模块。
        </ElAlert>

        <ElCard header="法律信息统计" size="small">
          <ElRow :gutter="16">
            <ElCol :span="6">
              <div class="rounded bg-gray-50 p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">1234</div>
                <div class="text-sm text-gray-500">法律条款数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-gray-50 p-4 text-center">
                <div class="text-2xl font-bold text-green-600">567</div>
                <div class="text-sm text-gray-500">案件数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-gray-50 p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">89</div>
                <div class="text-sm text-gray-500">律师数量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="rounded bg-gray-50 p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">2345</div>
                <div class="text-sm text-gray-500">客户数量</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>

        <ElCard header="快速操作" size="small">
          <ElSpace>
            <ElButton type="primary" @click="handleAddCase">
              <i class="i-lucide-plus mr-1"></i>
              添加案件
            </ElButton>
            <ElButton type="info" @click="handleSearchLaw">
              <i class="i-lucide-search mr-1"></i>
              法律检索
            </ElButton>
            <ElButton type="success" @click="handleGenerateReport">
              <i class="i-lucide-file-text mr-1"></i>
              生成报告
            </ElButton>
          </ElSpace>
        </ElCard>

        <ElCard header="最近活动" size="small">
          <ElTimeline>
            <ElTimelineItem timestamp="2024-01-15 10:30">
              <ElTag type="success">新增</ElTag>
              添加了新的法律条款：民法典第123条
            </ElTimelineItem>
            <ElTimelineItem timestamp="2024-01-14 15:20">
              <ElTag type="warning">更新</ElTag>
              更新了案件状态：案件编号2024001
            </ElTimelineItem>
            <ElTimelineItem timestamp="2024-01-13 09:15">
              <ElTag type="info">处理</ElTag>
              处理了客户咨询：张先生的法律问题
            </ElTimelineItem>
          </ElTimeline>
        </ElCard>
      </ElSpace>
    </ElCard>
  </div>
</template>

<style scoped>
/* 自定义样式 */
:deep(.vben-card) {
  border-radius: 8px;
}
</style>
