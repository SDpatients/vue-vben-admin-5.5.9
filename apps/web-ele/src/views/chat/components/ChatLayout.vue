<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式布局状态
const isMobile = ref(false);
const isTablet = ref(false);
const showContactList = ref(true);
const showSessionList = ref(true);

// 监听窗口大小变化
function handleResize() {
  const width = window.innerWidth;
  isMobile.value = width < 768;
  isTablet.value = width >= 768 && width < 1200;

  // 根据屏幕尺寸调整显示的列表
  if (isMobile.value) {
    showContactList.value = false;
    showSessionList.value = false;
  } else if (isTablet.value) {
    showContactList.value = true;
    showSessionList.value = false;
  } else {
    showContactList.value = true;
    showSessionList.value = true;
  }
}

// 计算属性
const layoutClass = computed(() => {
  if (isMobile.value) {
    return 'chat-layout-mobile';
  } else if (isTablet.value) {
    return 'chat-layout-tablet';
  } else {
    return 'chat-layout-desktop';
  }
});

// 方法
function toggleContactList() {
  showContactList.value = !showContactList.value;
}

function toggleSessionList() {
  showSessionList.value = !showSessionList.value;
}

function goBack() {
  router.back();
}

// 生命周期钩子
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="chat-layout-container">
    <!-- 顶部导航栏 -->
    <header class="chat-layout-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-back" @click="goBack">
          返回
        </el-button>
        <h1 class="header-title">通信</h1>
      </div>
      <div class="header-right">
        <el-button type="text" icon="el-icon-search">搜索</el-button>
        <el-button type="text" icon="el-icon-plus">新建</el-button>
        <el-button type="text" icon="el-icon-setting">设置</el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="chat-layout-main" :class="layoutClass">
      <!-- 左侧联系人列表 -->
      <aside
        v-if="showContactList || !isMobile"
        class="chat-layout-sidebar contact-list"
      >
        <div class="sidebar-header">
          <h3>联系人</h3>
          <el-button
            v-if="isTablet"
            type="text"
            icon="el-icon-close"
            @click="toggleContactList"
          >
            关闭
          </el-button>
        </div>
        <div class="sidebar-content">
          <!-- 联系人列表组件将在这里渲染 -->
          <slot name="contact-list"></slot>
        </div>
      </aside>

      <!-- 中间会话列表 -->
      <aside
        v-if="showSessionList && !isTablet"
        class="chat-layout-sidebar session-list"
      >
        <div class="sidebar-header">
          <h3>会话</h3>
          <el-button
            v-if="isTablet"
            type="text"
            icon="el-icon-close"
            @click="toggleSessionList"
          >
            关闭
          </el-button>
        </div>
        <div class="sidebar-content">
          <!-- 会话列表组件将在这里渲染 -->
          <slot name="session-list"></slot>
        </div>
      </aside>

      <!-- 右侧聊天窗口或主内容 -->
      <section class="chat-layout-content">
        <!-- 聊天窗口或主内容将在这里渲染 -->
        <slot></slot>
      </section>
    </main>
  </div>
</template>

<style scoped>
.chat-layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.chat-layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

.chat-layout-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 桌面端三栏布局 */
.chat-layout-desktop {
  display: grid;
  grid-template-columns: 300px 350px 1fr;
}

/* 平板端两栏布局 */
.chat-layout-tablet {
  display: grid;
  grid-template-columns: 320px 1fr;
}

/* 移动端单栏布局 */
.chat-layout-mobile {
  display: grid;
  grid-template-columns: 1fr;
}

.chat-layout-sidebar {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-layout-content {
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
