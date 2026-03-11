<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationApi, type Notification } from '#/api/core/notification';
import { Icon } from '@iconify/vue';
import { ElButton, ElSelect, ElOption, ElCard, ElScrollbar, ElEmpty, ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const selectedType = ref('');

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

const loadNotifications = async () => {
  loading.value = true;
  try {
    const userId = 1;
    
    const res = await notificationApi.getUnreadNotifications(userId);
    console.log('加载通知中心结果:', res);
    // requestClient 配置了 responseReturn: 'data'，所以 res 已经是 data 数组
    notifications.value = Array.isArray(res) ? res : (res.data || []);
  } catch (error) {
    console.error('加载通知中心失败:', error);
    notifications.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredNotifications = computed(() => {
  if (!selectedType.value) {
    return notifications.value;
  }
  return notifications.value.filter((item) => item.type === selectedType.value);
});

const loadMore = async () => {
  // 未读通知接口不支持分页，此方法不再使用
  loading.value = false;
};

const handleNotificationClick = async (item: Notification) => {
  // 点击通知时只标记为已读，不跳转页面
  if (!item.isRead) {
    await notificationApi.markAsRead(item.id);
    item.isRead = true;
  }
};

const markAllAsRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    // 重新加载通知数据
    await loadNotifications();
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const markAsRead = async (id: number) => {
  try {
    await notificationApi.markAsRead(id);
    // 重新加载通知数据
    await loadNotifications();
    ElMessage.success('标记已读成功');
  } catch (error) {
    console.error('标记已读失败:', error);
    ElMessage.error('操作失败');
  }
};

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    SYSTEM: '系统通知',
    APPROVAL: '审核通知',
    TODO: '待办提醒',
    ACTIVITY: '动态通知',
    WORK_LOG: '工作日志',
    DOCUMENT_DELIVERY: '文书送达',
    CASE: '案件通知',
    CASE_ANNOUNCEMENT: '案件公告',
  };
  return textMap[type] || type;
};

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    SYSTEM: '#1890ff',
    APPROVAL: '#faad14',
    TODO: '#52c41a',
    ACTIVITY: '#722ed1',
    WORK_LOG: '#13c2c2',
    DOCUMENT_DELIVERY: '#f5222d',
    CASE: '#722ed1',
    CASE_ANNOUNCEMENT: '#1890ff',
  };
  return colorMap[type] || '#999';
};

onMounted(() => {
  loadNotifications();
});
</script>

<template>
  <div class="notification-center-page">
    <div class="page-header">
      <h2>通知中心</h2>
      <ElButton type="primary" @click="markAllAsRead">
        <Icon icon="lucide:check-square" :size="16" class="mr-1" />
        全部已读
      </ElButton>
    </div>

    <div class="page-content">
      <div class="filter-bar">
        <ElSelect
          v-model="selectedType"
          style="width: 150px"
          placeholder="通知类型"
          clearable
          @change="loadNotifications"
        >
          <ElOption label="系统通知" value="SYSTEM" />
          <ElOption label="审核通知" value="APPROVAL" />
          <ElOption label="待办提醒" value="TODO" />
          <ElOption label="动态通知" value="ACTIVITY" />
          <ElOption label="工作日志" value="WORK_LOG" />
          <ElOption label="文书送达" value="DOCUMENT_DELIVERY" />
          <ElOption label="案件通知" value="CASE" />
          <ElOption label="案件公告" value="CASE_ANNOUNCEMENT" />
        </ElSelect>
      </div>

      <div class="notification-list">
        <ElScrollbar max-height="600px">
          <div v-loading="loading">
            <ElCard
              v-for="item in filteredNotifications"
              :key="item.id"
              shadow="hover"
              class="notification-item"
              :class="{ unread: !item.isRead }"
            >
              <div class="notification-content">
                <div class="notification-header">
                  <div class="notification-type" :style="{ color: getTypeColor(item.type) }">
                    <Icon icon="lucide:bell" :size="16" class="mr-1" />
                    {{ getTypeText(item.type) }}
                  </div>
                </div>
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-text">{{ item.content }}</div>
                <div class="notification-footer">
                  <span class="notification-time">{{ formatTime(item.createTime) }}</span>
                  <ElButton
                    size="small"
                    type="primary"
                    @click.stop="markAsRead(item.id)"
                  >
                    <Icon icon="lucide:check" :size="14" class="mr-1" />
                    我已知晓
                  </ElButton>
                </div>
              </div>
            </ElCard>
            <ElEmpty v-if="filteredNotifications.length === 0 && !loading" description="暂无通知" />
          </div>
        </ElScrollbar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-center-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.filter-bar {
  margin-bottom: 20px;
}

.notification-list {
  min-height: 400px;
}

.notification-item {
  display: flex;
  align-items: stretch;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  transform: translateX(4px);
}

.notification-item.unread {
  border-left: 4px solid #1890ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.notification-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.notification-type {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}

.notification-title {
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.notification-text {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  font-size: 13px;
  color: #606266;
  -webkit-box-orient: vertical;
  flex: 1;
}

.notification-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  display: flex;
  gap: 4px;
}

.load-more {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

.mr-1 {
  margin-right: 4px;
}
</style>
