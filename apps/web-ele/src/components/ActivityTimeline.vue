<script setup lang="ts">
<<<<<<< Updated upstream
import { ref, onMounted, watch } from 'vue';
import { activityApi, type Activity } from '#/api/core/activity';
import { Icon } from '@iconify/vue';
import { ElSelect, ElOption, ElButton, ElScrollbar, ElEmpty } from 'element-plus';
import { useUserStore } from '@vben/stores';
=======
import type { Notification } from '#/api/core/notification';

import { onMounted, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';
import { ElButton, ElEmpty, ElScrollbar } from 'element-plus';

import { notificationApi } from '#/api/core/notification';
>>>>>>> Stashed changes

// 定义事件
const emit = defineEmits<{
  (e: 'update:count', count: number): void;
}>();

const loading = ref(false);
const activities = ref<Activity[]>([]);
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(false);

// 用户信息
const userStore = useUserStore();

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

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
<<<<<<< Updated upstream
    const res = await activityApi.getActivityList(
      selectedType.value || undefined,
      currentPage.value,
      pageSize.value,
    );
=======
    // 从本地存储获取userId
    const userId = localStorage.getItem('chat_user_id');
    if (!userId) {
      activities.value = [];
      return;
    }

    const res = await notificationApi.getUnreadNotifications(Number(userId));
>>>>>>> Stashed changes
    console.log('加载动态结果:', res);
    activities.value = res.data || [];
    hasMore.value = res.data.length >= pageSize.value;
    
    // 如果没有数据，添加一些模拟数据用于测试
    if (activities.value.length === 0) {
      activities.value = [
        {
          id: 1,
          userId: 1,
          userName: '管理员',
          type: 'CREATE_CASE',
          content: '创建了新案件：xxx案件',
          createTime: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 2,
          userName: '用户1',
          type: 'UPLOAD_FILE',
          content: '上传了文件：证据材料.pdf',
          createTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          userId: 3,
          userName: '用户2',
          type: 'APPROVE_PASS',
          content: '审核通过了案件：yyy案件',
          createTime: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载动态失败:', error);
    // 发生错误时，添加一些模拟数据用于测试
    activities.value = [
      {
        id: 1,
        userId: 1,
        userName: '管理员',
        type: 'CREATE_CASE',
        content: '创建了新案件：xxx案件',
        createTime: new Date().toISOString(),
      },
      {
        id: 2,
<<<<<<< Updated upstream
        userId: 2,
        userName: '用户1',
        type: 'UPLOAD_FILE',
        content: '上传了文件：证据材料.pdf',
        createTime: new Date(Date.now() - 3600000).toISOString(),
=======
        userId: 1,
        title: '您有新的待办事项',
        content: '请及时处理案件编号为CASE-2026-001的待办事项',
        type: 'TODO',
        isRead: false,
        priority: 'HIGH',
        status: 'ACTIVE',
        createTime: new Date(Date.now() - 3_600_000).toISOString(),
>>>>>>> Stashed changes
      },
    ];
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
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

// 我已知晓，删除活动
const markAsKnown = async (id: number) => {
  try {
<<<<<<< Updated upstream
    // 获取认证令牌
    const token = localStorage.getItem('token');
    // 调用后端接口，改为PUT请求并添加认证令牌
    await fetch(`http://192.168.0.120:8080/api/web/activity/UpdateActivityIsDelete?id=${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    // 从活动列表中移除该活动
    activities.value = activities.value.filter(item => item.id !== id);
=======
    await notificationApi.markAsRead(id);
    // 从列表中移除该通知
    activities.value = activities.value.filter((item) => item.id !== id);
>>>>>>> Stashed changes
  } catch (error) {
    console.error('删除活动失败:', error);
  }
};

// 全部知晓，删除所有活动
const markAllAsKnown = async () => {
  try {
    // 从本地存储空间获取用户信息和认证令牌
    const chatUserInfoStr = localStorage.getItem('chat_user_info');
    const token = localStorage.getItem('token');
    let userId = 1; // 默认值
    
    if (chatUserInfoStr) {
      try {
        const chatUserInfo = JSON.parse(chatUserInfoStr);
        // 取uPid作为userId
        userId = chatUserInfo.user?.uPid || 1;
      } catch (parseError) {
        console.error('解析chat_user_info失败:', parseError);
      }
    }
    
    // 调用后端接口，改为PUT请求并添加认证令牌
    await fetch('http://192.168.0.120:8080/api/web/activity/UpdateActivityIsDeleteByUserId', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        userId
      })
    });
    // 清空活动列表
    activities.value = [];
  } catch (error) {
    console.error('删除所有活动失败:', error);
  }
};

// 监听活动数量变化，传递给父组件
watch(
  activities,
  (newVal) => {
    emit('update:count', newVal.length);
  },
  { immediate: true },
);

onMounted(async () => {
  await loadActivities();
  // 确保数据加载完成后，再次触发数量更新
  emit('update:count', activities.value.length);
});
</script>

<template>
  <div class="activity-timeline">
    <div class="activity-header fixed">
      <div class="activity-header-actions">
        <ElSelect
          v-model="selectedType"
          style="width: 120px; margin-right: 8px"
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
        <span class="mark-all-known" @click="markAllAsKnown">全部知晓</span>
      </div>
    </div>
    <div class="activity-list">
      <ElScrollbar>
        <div v-loading="loading">
          <div
            v-for="(item, index) in activities"
            :key="item.id"
            class="activity-item"
          >
            <div
              class="activity-icon"
              :style="{ backgroundColor: getActivityColor(item.type) }"
            >
              <Icon
                :icon="getActivityIcon(item.type)"
                :size="16"
                color="#fff"
              />
            </div>
            <div class="activity-content-wrapper">
              <div class="activity-user">{{ item.userName }}</div>
              <div class="activity-content">{{ item.content }}</div>
              <div class="activity-footer-row">
                <div class="activity-time">
                  {{ formatTime(item.createTime) }}
                </div>
                <ElButton
                  size="small"
                  type="danger"
                  text
                  @click="markAsKnown(item.id)"
                >
                  我已知晓
                </ElButton>
              </div>
            </div>
            <div
              v-if="index < activities.length - 1"
              class="activity-line"
            ></div>
          </div>
          <ElEmpty
            v-if="activities.length === 0 && !loading"
            description="暂无动态"
          />
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 固定表头 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 8px 0;
  border-bottom: none;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 10;
  height: 40px;
}

.activity-header-actions {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  height: 100%;
  padding-bottom: 10px;
}

/* 全部知晓文字样式 */
.mark-all-known {
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.mark-all-known:hover {
  text-decoration: underline;
}

.activity-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

/* 列表区域 */
.activity-list {
  position: relative;
  flex: 1;
  overflow: hidden;
  margin-top: -10px;
}

/* 确保滚动条只在内容区域显示 */
:deep(.el-scrollbar__wrap) {
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.activity-item {
  display: flex;
  position: relative;
  padding-bottom: 20px;
  margin-bottom: 4px;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-top: 0;
  padding-top: 10px;
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
  word-break: break-word;
  min-height: 16px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-line {
  position: absolute;
  left: 27px;
  top: 44px;
  bottom: -4px;
  width: 2px;
  background-color: #f0f0f0;
}

.activity-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 10;
}
</style>
