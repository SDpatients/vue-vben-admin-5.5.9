<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Props
const props = defineProps<{
  showGroups?: boolean;
  showSearch?: boolean;
}>();
// Emits
const emit = defineEmits<{
  (e: 'select', contactId: number): void;
  (e: 'search', keyword: string): void;
}>();
const router = useRouter();

// 状态
const searchKeyword = ref('');
const selectedGroup = ref<null | number>(null);

// 模拟数据
const mockContacts = [
  {
    id: 1,
    name: '张三',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isOnline: true,
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: '10:30',
    groupId: 1,
  },
  {
    id: 2,
    name: '李四',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isOnline: false,
    lastMessage: '明天开会记得准备资料',
    lastMessageTime: '昨天',
    groupId: 2,
  },
  {
    id: 3,
    name: '王五',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isOnline: true,
    lastMessage: '项目进度如何？',
    lastMessageTime: '09:15',
    groupId: 1,
  },
  {
    id: 4,
    name: '赵六',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isOnline: true,
    lastMessage: '周末一起去爬山吗？',
    lastMessageTime: '昨天',
    groupId: 3,
  },
  {
    id: 5,
    name: '孙七',
    avatar:
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isOnline: false,
    lastMessage: '报告已经发送到你的邮箱',
    lastMessageTime: '2023-05-18',
    groupId: 4,
  },
];

const mockGroups = [
  { id: 1, name: '默认分组', count: 2 },
  { id: 2, name: '家人', count: 1 },
  { id: 3, name: '朋友', count: 1 },
  { id: 4, name: '同事', count: 1 },
];

// 计算属性
const filteredContacts = computed(() => {
  let result = [...mockContacts];

  // 按分组筛选
  if (selectedGroup.value !== null) {
    result = result.filter(
      (contact) => contact.groupId === selectedGroup.value,
    );
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (contact) =>
        contact.name.toLowerCase().includes(keyword) ||
        contact.lastMessage.toLowerCase().includes(keyword),
    );
  }

  // 按是否在线和姓名排序
  result.sort((a, b) => {
    // 在线联系人排在前面
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    // 按姓名排序
    return a.name.localeCompare(b.name);
  });

  return result;
});

// 方法
function handleContactClick(contactId: number) {
  emit('select', contactId);
  router.push(`/chat/contact/${contactId}`);
}

function handleSearch() {
  emit('search', searchKeyword.value);
}

function handleGroupClick(groupId: number) {
  selectedGroup.value = groupId === selectedGroup.value ? null : groupId;
}
</script>

<template>
  <div class="contact-list">
    <!-- 搜索栏 -->
    <div v-if="props.showSearch !== false" class="contact-list-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索联系人"
        prefix-icon="el-icon-search"
        size="small"
        @input="handleSearch"
      />
    </div>

    <!-- 联系人分组 -->
    <div v-if="props.showGroups !== false" class="contact-groups">
      <div
        class="group-item"
        :class="{ active: selectedGroup === null }"
        @click="handleGroupClick(0)"
      >
        <h4>全部联系人 ({{ mockContacts.length }})</h4>
      </div>

      <div
        v-for="group in mockGroups"
        :key="group.id"
        class="group-item"
        :class="{ active: selectedGroup === group.id }"
        @click="handleGroupClick(group.id)"
      >
        <h4>{{ group.name }} ({{ group.count }})</h4>
      </div>
    </div>

    <!-- 联系人列表 -->
    <div class="contact-items">
      <div
        v-for="contact in filteredContacts"
        :key="contact.id"
        class="contact-item"
        @click="handleContactClick(contact.id)"
      >
        <div class="contact-avatar">
          <el-avatar :src="contact.avatar" size="small" />
          <span v-if="contact.isOnline" class="online-indicator"></span>
        </div>
        <div class="contact-info">
          <div class="contact-name">{{ contact.name }}</div>
          <div class="contact-last-message">{{ contact.lastMessage }}</div>
        </div>
        <div class="contact-time">{{ contact.lastMessageTime }}</div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredContacts.length === 0" class="contact-empty">
        <div class="empty-icon">
          <i class="el-icon-user"></i>
        </div>
        <p>暂无联系人</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

/* 搜索栏样式 */
.contact-list-search {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

/* 分组样式 */
.contact-groups {
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.group-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-item:hover {
  background-color: #f5f7fa;
}

.group-item.active {
  background-color: #ecf5ff;
}

.group-item h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 联系人列表样式 */
.contact-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 0 8px;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

/* 联系人头像样式 */
.contact-avatar {
  position: relative;
  margin-right: 12px;
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

/* 联系人信息样式 */
.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.contact-last-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 时间样式 */
.contact-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: 8px;
}

/* 空状态样式 */
.contact-empty {
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

/* 滚动条样式 */
.contact-items::-webkit-scrollbar {
  width: 6px;
}

.contact-items::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.contact-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.contact-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
