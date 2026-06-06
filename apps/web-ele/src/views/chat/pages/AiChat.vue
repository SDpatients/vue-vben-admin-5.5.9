<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AiChatWindow from '../components/AiChatWindow.vue';
import { useAiChatStore } from '../stores/ai-chat';

const route = useRoute();
const router = useRouter();
const aiChatStore = useAiChatStore();

const caseId = ref(0);
const caseName = ref('');

onMounted(async () => {
  const id = route.params.caseId ?? route.query.caseId;
  if (id) {
    caseId.value = Number(id);
    aiChatStore.setCaseId(caseId.value);
  }

  const name = route.query.caseName;
  if (name) {
    caseName.value = String(name);
  }

  if (caseId.value > 0) {
    await aiChatStore.fetchHistory();
  }
});

onUnmounted(() => {
  aiChatStore.$reset();
});

function handleBack() {
  if (caseId.value > 0) {
    router.push({ name: 'LawCaseDetail', params: { id: caseId.value } });
  } else {
    router.back();
  }
}
</script>

<template>
  <div class="ai-chat-page">
    <AiChatWindow
      v-if="caseId > 0"
      :case-id="caseId"
      :case-name="caseName"
      @back="handleBack"
    />
    <div v-else class="no-case">
      <p>未指定案件ID，无法启动AI助手</p>
      <el-button type="primary" @click="router.push({ name: 'LawCaseList' })">
        返回案件列表
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.ai-chat-page {
  height: 100%;
  overflow: hidden;
}

.no-case {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
</style>