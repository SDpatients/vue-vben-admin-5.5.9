<script setup lang="ts">
import { ref } from 'vue';

import { Icon } from '@iconify/vue';
import { ElButton, ElCard, ElTabPane, ElTabs } from 'element-plus';

import ClaimRegistrationStageOne from './ClaimRegistrationStageOne.vue';
import ClaimRegistrationStageTwo from './ClaimRegistrationStageTwo.vue';
import ClaimRegistrationStageThree from './ClaimRegistrationStageThree.vue';
import CreditorInfo from './CreditorInfo.vue';

const props = defineProps<{
  caseId: string;
}>();

const activeTab = ref('stage1');
const stageOneRef = ref<InstanceType<typeof ClaimRegistrationStageOne> | null>(
  null,
);

const handleTabChange = (tabName: string) => {
  console.log('切换标签页:', tabName);
};

const handleImport = () => {
  activeTab.value = 'stage1';
  setTimeout(() => {
    stageOneRef.value?.openImportDialog();
  }, 0);
};

const handleAdd = () => {
  activeTab.value = 'stage1';
  setTimeout(() => {
    stageOneRef.value?.openAddDialog();
  }, 0);
};
</script>

<template>
  <div class="claim-registration-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-text" class="mr-2 text-primary" />
            <span class="text-lg font-semibold">债权登记表</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="success" @click="handleImport">
              <Icon icon="lucide:file-spreadsheet" class="mr-1" />
              Excel导入
            </ElButton>
            <ElButton type="primary" @click="handleAdd">
              <Icon icon="lucide:plus" class="mr-1" />
              新增债权
            </ElButton>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="债权人信息" name="creditorInfo">
          <template #label>
            <div class="tab-label">
              <Icon icon="lucide:users" class="mr-1" />
              债权人信息
            </div>
          </template>
          <CreditorInfo :case-id="caseId" />
        </ElTabPane>

        <ElTabPane label="债权申报登记" name="stage1">
          <template #label>
            <div class="tab-label">
              <Icon icon="lucide:file-plus" class="mr-1" />
              债权申报登记
            </div>
          </template>
          <ClaimRegistrationStageOne ref="stageOneRef" :case-id="caseId" />
        </ElTabPane>

        <ElTabPane label="债权审查" name="stage2">
          <template #label>
            <div class="tab-label">
              <Icon icon="lucide:file-search" class="mr-1" />
              债权审查
            </div>
          </template>
          <ClaimRegistrationStageTwo :case-id="caseId" />
        </ElTabPane>

        <ElTabPane label="债权确认" name="stage3">
          <template #label>
            <div class="tab-label">
              <Icon icon="lucide:file-check" class="mr-1" />
              债权确认
            </div>
          </template>
          <ClaimRegistrationStageThree :case-id="caseId" />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<style scoped>
.claim-registration-container {
  padding: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}
</style>
