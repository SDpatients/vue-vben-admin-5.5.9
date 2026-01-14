<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationApi, type Notification } from '#/api/core/notification';
import { Icon } from '@iconify/vue';
import { ElButton, ElSelect, ElOption, ElCard, ElScrollbar, ElEmpty, ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
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

const loadNotifications = async () => {
  loading.value = true;
  currentPage.value = 1;
  try {
    const res = await notificationApi.getNotificationList(currentPage.value, pageSize.value);
    console.log('加载通知中心结果:', res);
    notifications.value = res.data || [];
    hasMore.value = res.data.length >= pageSize.value;
    
    // 如果没有数据，添加一些模拟数据用于测试
    if (notifications.value.length === 0) {
      notifications.value = [
        {
          id: 1,
          userId: 1,
          type: 'SYSTEM',
          title: '系统通知',
          content: '您有新的系统消息',
          isRead: false,
          createTime: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'CASE',
          title: '案件更新',
          content: '您的案件已经更新',
          isRead: true,
          createTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          userId: 1,
          type: 'APPROVAL',
          title: '审批通知',
          content: '您有新的审批请求',
          isRead: false,
          createTime: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 4,
          userId: 1,
          type: 'TODO',
          title: '待办提醒',
          content: '您有新的待办事项',
          isRead: false,
          createTime: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: 5,
          userId: 1,
          type: 'ACTIVITY',
          title: '动态通知',
          content: '您有新的活动动态',
          isRead: true,
          createTime: new Date(Date.now() - 14400000).toISOString(),
        },
      ];
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载通知中心失败:', error);
    // 发生错误时，添加一些模拟数据用于测试
    notifications.value = [
      {
        id: 1,
        userId: 1,
        type: 'SYSTEM',
        title: '系统通知',
        content: '您有新的系统消息',
        isRead: false,
        createTime: new Date().toISOString(),
      },
      {
        id: 2,
        userId: 1,
        type: 'CASE',
        title: '案件更新',
        content: '您的案件已经更新',
        isRead: true,
        createTime: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  loading.value = true;
  currentPage.value++;
  try {
    const res = await notificationApi.getNotificationList(currentPage.value, pageSize.value);
    notifications.value = [...notifications.value, ...(res.data || [])];
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error('加载更多失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (item: Notification) => {
  if (!item.isRead) {
    await notificationApi.markAsRead(item.id);
    item.isRead = true;
  }
  if (item.relatedType && item.relatedId) {
    router.push(`/${item.relatedType.toLowerCase()}/${item.relatedId}`);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    notifications.value.forEach((item) => {
      item.isRead = true;
    });
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const deleteNotification = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await notificationApi.deleteNotification(id);
    notifications.value = notifications.value.filter((item) => item.id !== id);
    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    SYSTEM: '系统通知',
    APPROVAL: '审核通知',
    TODO: '待办提醒',
    ACTIVITY: '动态通知',
  };
  return textMap[type] || type;
};

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    SYSTEM: '#1890ff',
    APPROVAL: '#faad14',
    TODO: '#52c41a',
    ACTIVITY: '#722ed1',
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
        </ElSelect>
      </div>

      <div class="notification-list">
        <ElScrollbar max-height="600px">
          <div v-loading="loading">
            <ElCard
              v-for="item in notifications"
              :key="item.id"
              shadow="hover"
              class="notification-item"
              :class="{ unread: !item.isRead }"
              @click="handleNotificationClick(item)"
            >
              <div class="notification-content">
                <div class="notification-header">
                  <div class="notification-type" :style="{ color: getTypeColor(item.type) }">
                    <Icon icon="lucide:bell" :size="16" class="mr-1" />
                    {{ getTypeText(item.type) }}
                  </div>
                  <div class="notification-time">{{ formatTime(item.createTime) }}</div>
                </div>
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-text">{{ item.content }}</div>
              </div>
              <div class="notification-actions">
                <ElButton
                  circle
                  size="small"
                  type="danger"
                  @click.stop="deleteNotification(item.id)"
                >
                  <Icon icon="lucide:trash-2" :size="14" />
                </ElButton>
              </div>
            </ElCard>
            <div v-if="hasMore" class="load-more">
              <ElButton link @click="loadMore">加载更多</ElButton>
            </div>
            <ElEmpty v-if="notifications.length === 0 && !loading" description="暂无通知" />
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
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  transform: translateX(4px);
}

.notification-item.unread {
  background-color: #f0f9ff;
  border-left: 4px solid #1890ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notification-type {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}

.notification-time {
  font-size: 12px;
  color: #909399;
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
}

.notification-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
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
