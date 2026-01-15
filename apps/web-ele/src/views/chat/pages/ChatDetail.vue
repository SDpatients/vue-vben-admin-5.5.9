<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ChatWindow from '../components/ChatWindow.vue';
import { useChatStore } from '../stores/chat';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();

// 获取联系人ID和会话ID
const contactId = computed(() => Number(route.params.contactId) || 0);
const conversationId = computed(() => Number(route.params.conversationId) || 0);

// 模拟联系人数据
const mockContact = {
  id: 1,
  name: '张三',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  isOnline: true,
  phone: '13800138000',
  email: 'zhangsan@example.com',
};

// 方法
function goBack() {
  router.back();
}

// 生命周期钩子
onMounted(async () => {
  try {
    await chatStore.initializeData();
  } catch (error) {
    console.error('初始化聊天数据失败:', error);
  }
});
</script>

<template>
  <div class="chat-detail-container">
    <ChatWindow
      :contact-avatar="mockContact.avatar"
      :contact-id="contactId"
      :contact-name="mockContact.name"
      :is-online="mockContact.isOnline"
      :conversation-id="conversationId"
      @back="goBack"
    />
  </div>
</template>

<style scoped>
.chat-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}
</style>
