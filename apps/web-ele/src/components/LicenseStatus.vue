<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Key } from '@element-plus/icons-vue';

import { useLicenseStore } from '#/store';

const router = useRouter();
const licenseStore = useLicenseStore();

const licenseStatus = computed(() => licenseStore.licenseStatus);
const remainingDays = computed(() => licenseStore.getRemainingDays());

onMounted(async () => {
  if (!licenseStore.licenseChecked) {
    await licenseStore.fetchLicenseStatus();
  }
});

function goToLicense() {
  router.push('/license');
}
</script>

<template>
  <div v-if="licenseStatus && licenseStatus.valid" class="license-status">
    <el-tooltip
      :content="`许可证剩余 ${remainingDays} 天`"
      placement="bottom"
    >
      <el-tag
        :type="remainingDays < 30 ? 'danger' : 'success'"
        size="small"
        effect="plain"
        class="license-tag"
        @click="goToLicense"
      >
        <el-icon class="license-icon"><Key /></el-icon>
        {{ remainingDays < 30 ? '即将过期' : '已授权' }}
        <span v-if="remainingDays < 30" class="days-left">({{ remainingDays }}天)</span>
      </el-tag>
    </el-tooltip>
  </div>
</template>

<style scoped>
.license-status {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.license-tag {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.license-tag:hover {
  opacity: 0.8;
}

.license-icon {
  font-size: 14px;
}

.days-left {
  font-size: 12px;
  margin-left: 2px;
}
</style>
