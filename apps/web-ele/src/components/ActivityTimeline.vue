<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { activityApi, type Activity } from '#/api/core/activity';
import { Icon } from '@iconify/vue';
import { ElSelect, ElOption, ElButton, ElScrollbar, ElEmpty } from 'element-plus';

const loading = ref(false);
const activities = ref<Activity[]>([]);
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(false);

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

const loadActivities = async () => {
  loading.value = true;
  currentPage.value = 1;
  try {
    const res = await activityApi.getActivityList(
      selectedType.value || undefined,
      currentPage.value,
      pageSize.value,
    );
    activities.value = res.data || [];
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error('加载动态失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  loading.value = true;
  currentPage.value++;
  try {
    const res = await activityApi.getActivityList(
      selectedType.value || undefined,
      currentPage.value,
      pageSize.value,
    );
    activities.value = [...activities.value, ...(res.data || [])];
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error('加载更多失败:', error);
  } finally {
    loading.value = false;
  }
};

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    CREATE_CASE: 'lucide:file-plus',
    UPLOAD_FILE: 'lucide:upload',
    APPROVE_PASS: 'lucide:check-circle',
    APPROVE_REJECT: 'lucide:x-circle',
    COMPLETE_TODO: 'lucide:check-square',
  };
  return iconMap[type] || 'lucide:activity';
};

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    CREATE_CASE: '#1890ff',
    UPLOAD_FILE: '#52c41a',
    APPROVE_PASS: '#52c41a',
    APPROVE_REJECT: '#ff4d4f',
    COMPLETE_TODO: '#1890ff',
  };
  return colorMap[type] || '#999';
};

onMounted(() => {
  loadActivities();
});
</script>

<template>
  <div class="activity-timeline">
    <div class="activity-header">
      <h3>最新动态</h3>
      <ElSelect
        v-model="selectedType"
        style="width: 120px"
        placeholder="全部类型"
        @change="loadActivities"
      >
        <ElOption label="全部" value="" />
        <ElOption label="创建案件" value="CREATE_CASE" />
        <ElOption label="上传文件" value="UPLOAD_FILE" />
        <ElOption label="审核通过" value="APPROVE_PASS" />
        <ElOption label="审核驳回" value="APPROVE_REJECT" />
        <ElOption label="完成待办" value="COMPLETE_TODO" />
      </ElSelect>
    </div>
    <div class="activity-list">
      <ElScrollbar max-height="400px">
        <div v-loading="loading">
          <div
            v-for="(item, index) in activities"
            :key="item.id"
            class="activity-item"
          >
            <div class="activity-icon" :style="{ backgroundColor: getActivityColor(item.type) }">
              <Icon :icon="getActivityIcon(item.type)" :size="16" color="#fff" />
            </div>
            <div class="activity-content-wrapper">
              <div class="activity-user">{{ item.userName }}</div>
              <div class="activity-content">{{ item.content }}</div>
              <div class="activity-time">{{ formatTime(item.createTime) }}</div>
            </div>
            <div v-if="index < activities.length - 1" class="activity-line" />
          </div>
          <ElEmpty v-if="activities.length === 0 && !loading" description="暂无动态" />
        </div>
      </ElScrollbar>
    </div>
    <div v-if="hasMore" class="activity-footer">
      <ElButton link @click="loadMore">加载更多</ElButton>
    </div>
  </div>
</template>

<style scoped>
.activity-timeline {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.activity-list {
  position: relative;
}

.activity-item {
  display: flex;
  position: relative;
  padding-bottom: 20px;
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 12px;
  z-index: 1;
}

.activity-content-wrapper {
  flex: 1;
  min-width: 0;
}

.activity-user {
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 4px;
  font-size: 14px;
}

.activity-content {
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-line {
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: 0;
  width: 2px;
  background-color: #f0f0f0;
}

.activity-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
