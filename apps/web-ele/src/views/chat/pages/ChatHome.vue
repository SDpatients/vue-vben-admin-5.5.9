<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import ChatLayout from '../components/ChatLayout.vue';
import { useChatStore } from '../stores/chat';
import { useContactStore } from '../stores/contact';

const router = useRouter();

// 获取状态管理store
const contactStore = useContactStore();
const chatStore = useChatStore();

// 从store获取数据
const { contacts, fetchContacts, fetchContactGroups } = contactStore;
const { sessions, fetchChatSessions } = chatStore;

// 方法
function handleContactClick(contactId: number) {
  router.push(`/chat/contact/${contactId}`);
}

function handleSessionClick(contactId: number) {
  router.push(`/chat/contact/${contactId}`);
}

// 初始化数据
onMounted(() => {
  // 从API获取数据
  fetchContacts();
  fetchContactGroups();
  fetchChatSessions();
});

// 格式化时间
function formatTime(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }
  // 其他情况显示完整日期
  return date.toLocaleDateString();
}
</script>

<template>
  <ChatLayout>
    <!-- 联系人列表 -->
    <template #contact-list>
      <div class="contact-list-container">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            placeholder="搜索联系人"
            prefix-icon="el-icon-search"
            size="small"
          />
        </div>

        <!-- 联系人分组 -->
        <div class="contact-groups">
          <div class="group-item">
            <h4>
              在线联系人 ({{ contacts.filter((c) => c.isOnline).length }})
            </h4>
            <div class="contact-items">
              <div
                v-for="contact in contacts.filter((c) => c.isOnline)"
                :key="contact.id"
                class="contact-item"
                @click="handleContactClick(contact.id)"
              >
                <el-avatar :src="contact.avatar" size="small" />
                <div class="contact-info">
                  <div class="contact-name">
                    {{ contact.name }}
                    <el-tag v-if="contact.isOnline" type="success" size="small">
                      在线
                    </el-tag>
                  </div>
                  <div class="contact-last-message">
                    <!-- 暂时使用静态文本，后续可从消息列表中获取 -->
                    暂无消息
                  </div>
                </div>
                <div class="contact-time">
                  {{
                    contact.lastOnlineTime
                      ? formatTime(contact.lastOnlineTime)
                      : ''
                  }}
                </div>
              </div>
            </div>
          </div>

          <div class="group-item">
            <h4>
              离线联系人 ({{ contacts.filter((c) => !c.isOnline).length }})
            </h4>
            <div class="contact-items">
              <div
                v-for="contact in contacts.filter((c) => !c.isOnline)"
                :key="contact.id"
                class="contact-item"
                @click="handleContactClick(contact.id)"
              >
                <el-avatar :src="contact.avatar" size="small" />
                <div class="contact-info">
                  <div class="contact-name">
                    {{ contact.name }}
                    <el-tag type="info" size="small">离线</el-tag>
                  </div>
                  <div class="contact-last-message">
                    <!-- 暂时使用静态文本，后续可从消息列表中获取 -->
                    暂无消息
                  </div>
                </div>
                <div class="contact-time">
                  {{
                    contact.lastOnlineTime
                      ? formatTime(contact.lastOnlineTime)
                      : ''
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 会话列表 -->
    <template #session-list>
      <div class="session-list-container">
        <!-- 会话列表头部 -->
        <div class="session-header">
          <h3>会话</h3>
          <el-button type="text" icon="el-icon-plus" size="small">
            新建会话
          </el-button>
        </div>

        <!-- 会话列表内容 -->
        <div class="session-items">
          <!-- 加载中状态 -->
          <div v-if="chatStore.loading" class="loading-state">
            <i class="el-icon-loading loading-icon"></i>
            <span>加载中...</span>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="chatStore.error" class="error-state">
            <i class="el-icon-circle-close error-icon"></i>
            <span>{{ chatStore.error }}</span>
            <el-button type="primary" size="small" @click="fetchChatSessions">
              重试
            </el-button>
          </div>

          <!-- 空状态 -->
          <div v-else-if="sessions.length === 0" class="empty-state">
            <i class="el-icon-message empty-icon"></i>
            <span>暂无会话</span>
          </div>

          <!-- 会话列表 -->
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ 'session-item-pinned': session.isPinned }"
            @click="handleSessionClick(session.contactId)"
          >
            <!-- 这里需要根据contactId获取联系人信息，暂时使用静态头像 -->
            <el-avatar size="small">
              {{ session.contactId }}
            </el-avatar>
            <div class="session-info">
              <div class="session-name-row">
                <div class="session-name">联系人 {{ session.contactId }}</div>
                <div class="session-time">
                  {{ formatTime(session.lastActivityTime) }}
                </div>
              </div>
              <div class="session-last-message-row">
                <div class="session-last-message">
                  {{ session.lastMessage }}
                </div>
                <el-badge
                  v-if="session.unreadCount > 0"
                  :value="session.unreadCount"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 欢迎页面 -->
    <div class="welcome-container">
      <div class="welcome-content">
        <div class="welcome-icon">
          <i class="el-icon-message"></i>
        </div>
        <h2>欢迎使用通信功能</h2>
        <p>选择一个联系人或会话开始聊天</p>
        <div class="welcome-actions">
          <el-button
            type="primary"
            @click="$router.push('/chat/contacts')"
            icon="el-icon-user"
          >
            联系人管理
          </el-button>
        </div>
      </div>
    </div>
  </ChatLayout>
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.contact-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-bar {
  margin-bottom: 16px;
}

.contact-groups {
  flex: 1;
  overflow-y: auto;
}

.group-item {
  margin-bottom: 16px;
}

.group-item h4 {
  padding: 0 8px;
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item .el-avatar {
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.contact-last-message {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.contact-time {
  margin-left: 8px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 会话列表样式 */
.session-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.session-items {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

/* 状态样式 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.loading-icon,
.error-icon,
.empty-icon {
  margin-bottom: 16px;
  font-size: 48px;
}

.loading-icon {
  animation: rotate 2s linear infinite;
}

.error-icon {
  color: #f56c6c;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item-pinned {
  background-color: #ecf5ff;
}

.session-item .el-avatar {
  margin-right: 12px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.session-time {
  font-size: 12px;
  color: #c0c4cc;
}

.session-last-message-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-last-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

/* 欢迎页面样式 */
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
}

.welcome-content {
  padding: 40px;
  text-align: center;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.welcome-icon {
  margin-bottom: 16px;
  font-size: 64px;
  color: #408aed;
}

.welcome-content h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.welcome-content p {
  margin: 0 0 24px;
  font-size: 16px;
  color: #606266;
}

.welcome-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 联系人列表样式 */
</style>
