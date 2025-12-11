<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Props
const props = defineProps<{
  showHeader?: boolean;
  showSearch?: boolean;
}>();
// Emits
const emit = defineEmits<{
  (e: 'select', contactId: number): void;
  (e: 'search', keyword: string): void;
  (e: 'create'): void;
}>();
const router = useRouter();

// 状态
const searchKeyword = ref('');

// 模拟数据
const mockSessions = [
  {
    id: 1,
    contactId: 1,
    name: '张三',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: '10:30',
    unreadCount: 2,
    isPinned: true,
    isOnline: true,
  },
  {
    id: 2,
    contactId: 2,
    name: '李四',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastMessage: '明天开会记得准备资料',
    lastMessageTime: '昨天',
    unreadCount: 0,
    isPinned: false,
    isOnline: false,
  },
  {
    id: 3,
    contactId: 3,
    name: '王五',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastMessage: '项目进度如何？',
    lastMessageTime: '09:15',
    unreadCount: 1,
    isPinned: false,
    isOnline: true,
  },
  {
    id: 4,
    contactId: 4,
    name: '赵六',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastMessage: '周末一起去爬山吗？',
    lastMessageTime: '昨天',
    unreadCount: 0,
    isPinned: false,
    isOnline: true,
  },
];

// 计算属性
const filteredSessions = computed(() => {
  let result = [...mockSessions];

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (session) =>
        session.name.toLowerCase().includes(keyword) ||
        session.lastMessage.toLowerCase().includes(keyword),
    );
  }

  // 按是否置顶和最后消息时间排序
  result.sort((a, b) => {
    // 置顶会话排在前面
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // 按最后消息时间排序
    return (
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
    );
  });

  return result;
});

// 方法
function handleSessionClick(contactId: number) {
  emit('select', contactId);
  router.push(`/chat/contact/${contactId}`);
}

function handleSearch() {
  emit('search', searchKeyword.value);
}

function handleCreateSession() {
  emit('create');
}

function togglePin(sessionId: number) {
  // 模拟切换置顶状态
  const session = mockSessions.find((s) => s.id === sessionId);
  if (session) {
    session.isPinned = !session.isPinned;
  }
}
</script>

<template>
  <div class="session-list">
    <!-- 头部 -->
    <div v-if="props.showHeader !== false" class="session-list-header">
      <h3>会话</h3>
      <el-button
        type="text"
        icon="el-icon-plus"
        size="small"
        @click="handleCreateSession"
      >
        新建会话
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div v-if="props.showSearch !== false" class="session-list-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索会话"
        prefix-icon="el-icon-search"
        size="small"
        @input="handleSearch"
      />
    </div>

    <!-- 会话列表 -->
    <div class="session-items">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        class="session-item"
        :class="{ 'session-item-pinned': session.isPinned }"
        @click="handleSessionClick(session.contactId)"
      >
        <div class="session-avatar">
          <el-avatar :src="session.avatar" size="small" />
          <span v-if="session.isOnline" class="online-indicator"></span>
        </div>
        <div class="session-info">
          <div class="session-name-row">
            <div class="session-name">{{ session.name }}</div>
            <div class="session-time">{{ session.lastMessageTime }}</div>
          </div>
          <div class="session-last-message-row">
            <div class="session-last-message">{{ session.lastMessage }}</div>
            <el-badge
              v-if="session.unreadCount > 0"
              :value="session.unreadCount"
              size="small"
            />
          </div>
        </div>
        <div class="session-actions">
          <el-dropdown trigger="click">
            <el-button type="text" size="small" icon="el-icon-more" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.stop="togglePin(session.id)">
                  {{ session.isPinned ? '取消置顶' : '置顶会话' }}
                </el-dropdown-item>
                <el-dropdown-item>删除会话</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredSessions.length === 0" class="session-empty">
        <div class="empty-icon">
          <i class="el-icon-message"></i>
        </div>
        <p>暂无会话</p>
        <el-button type="primary" size="small" @click="handleCreateSession">
          开始新会话
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

/* 头部样式 */
.session-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.session-list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 搜索栏样式 */
.session-list-search {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

/* 会话列表样式 */
.session-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 0 8px;
  position: relative;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item-pinned {
  background-color: #ecf5ff;
}

/* 会话头像样式 */
.session-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #67c23a;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* 会话信息样式 */
.session-info {
  flex: 1;
  min-width: 0;
}

.session-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  justify-content: space-between;
  align-items: center;
}

.session-last-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* 会话操作样式 */
.session-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}

/* 空状态样式 */
.session-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.session-empty p {
  margin: 0 0 16px 0;
}

/* 滚动条样式 */
.session-items::-webkit-scrollbar {
  width: 6px;
}

.session-items::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.session-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.session-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
