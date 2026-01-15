<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// 响应式状态
const isMobile = ref(false);
const isTablet = ref(false);

// 左侧区域切换状态
const activeLeftTab = ref('messages'); // 'messages' 或 'contacts'

// 右侧详情面板显示状态
const showUserDetail = ref(false);

// 监听窗口大小变化
function handleResize() {
  const width = window.innerWidth;
  isMobile.value = width < 768;
  isTablet.value = width >= 768 && width < 1200;
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
function toggleLeftTab(tab: 'messages' | 'contacts') {
  activeLeftTab.value = tab;
}

function toggleUserDetail() {
  showUserDetail.value = !showUserDetail.value;
}

function closeUserDetail() {
  showUserDetail.value = false;
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
    <!-- 主内容区 -->
    <main class="chat-layout-main" :class="layoutClass">
      <!-- 左侧区域：联系人列表与消息窗口切换 -->
      <aside class="chat-layout-sidebar left-sidebar">
        <!-- 左侧标签切换栏 -->
        <div class="sidebar-tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeLeftTab === 'messages' }"
            @click="toggleLeftTab('messages')"
          >
            <i class="el-icon-message"></i>
            <span>消息</span>
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeLeftTab === 'contacts' }"
            @click="toggleLeftTab('contacts')"
          >
            <i class="el-icon-user"></i>
            <span>联系人</span>
          </div>
        </div>
        
        <!-- 左侧内容区域 -->
        <div class="sidebar-content">
          <!-- 消息窗口 -->
          <div v-if="activeLeftTab === 'messages'" class="left-content-section">
            <slot name="message-list"></slot>
          </div>
          
          <!-- 联系人列表 -->
          <div v-else class="left-content-section">
            <slot name="contact-list"></slot>
          </div>
        </div>
      </aside>

      <!-- 中间区域：聊天主内容 -->
      <section class="chat-layout-main-content">
        <!-- 中间顶部区域：聊天对象信息 -->
        <header class="chat-main-header" @click="toggleUserDetail">
          <div class="chat-user-info">
            <slot name="userAvatar"></slot>
            <div class="user-info-text">
              <slot name="userName">
                <div class="user-name">未选择聊天对象</div>
              </slot>
              <slot name="userStatus"></slot>
            </div>
          </div>
          <div class="chat-header-actions">
            <el-button link icon="el-icon-phone"></el-button>
            <el-button link icon="el-icon-video-camera"></el-button>
            <el-button link icon="el-icon-more"></el-button>
          </div>
        </header>
        
        <!-- 中间内容区域：聊天消息列表 -->
        <main class="chat-main-messages">
          <slot name="chat-messages"></slot>
        </main>
        
        <!-- 底部区域：消息输入框 -->
        <footer class="chat-main-footer">
          <slot name="message-input"></slot>
        </footer>
      </section>

      <!-- 右侧区域：用户详情信息面板 -->
      <aside 
        class="chat-layout-sidebar right-sidebar"
        :class="{ 'show': showUserDetail }"
      >
        <!-- 详情面板头部 -->
        <div class="sidebar-header">
          <h3>用户详情</h3>
          <el-button 
              type="text" 
              icon="el-icon-close" 
              @click="closeUserDetail"
            >
              关闭
            </el-button>
        </div>
        
        <!-- 详情面板内容 -->
        <div class="sidebar-content">
          <slot name="user-detail"></slot>
        </div>
      </aside>
      
      <!-- 详情面板遮罩层 -->
      <div 
        v-if="showUserDetail" 
        class="detail-overlay" 
        @click="closeUserDetail"
      ></div>
    </main>
  </div>
</template>

<style scoped>
.chat-layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.chat-layout-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100vh;
  position: relative;
}

/* 桌面端三栏布局 */
.chat-layout-desktop {
  display: grid;
  grid-template-columns: 300px 1fr 0px;
  transition: grid-template-columns 0.3s ease;
}

.chat-layout-desktop.right-sidebar.show {
  grid-template-columns: 300px 1fr 350px;
}

/* 平板端两栏布局 */
.chat-layout-tablet {
  display: grid;
  grid-template-columns: 300px 1fr 0px;
  transition: grid-template-columns 0.3s ease;
}

.chat-layout-tablet.right-sidebar.show {
  grid-template-columns: 250px 1fr 300px;
}

/* 移动端单栏布局 */
.chat-layout-mobile {
  display: grid;
  grid-template-columns: 1fr;
}

/* 左侧边栏样式 */
.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  height: 100%;
}

/* 左侧标签切换栏 */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  height: 56px;
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 8px;
  padding: 0 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.tab-item:hover {
  background-color: #f5f7fa;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
  background-color: #ecf5ff;
}

.tab-item i {
  font-size: 16px;
}

/* 右侧边栏样式 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  height: 100%;
  overflow: hidden;
  transition: transform 0.3s ease;
  transform: translateX(100%);
  z-index: 100;
}

.right-sidebar.show {
  transform: translateX(0);
}

/* 边栏通用样式 */
.sidebar-content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 56px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  height: 56px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 中间主内容区域样式 */
.chat-layout-main-content {
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  height: 100%;
  overflow: hidden;
}

/* 中间顶部聊天对象信息区域 */
.chat-main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  height: 56px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.chat-main-header:hover {
  background-color: #fafafa;
}

.chat-user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-info-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-status {
  font-size: 12px;
  color: #909399;
}

.chat-header-actions {
  display: flex;
  gap: 8px;
}

/* 中间聊天消息区域 */
.chat-main-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 56px - 200px);
  background-color: #f5f7fa;
}

/* 中间底部消息输入区域 */
.chat-main-footer {
  padding: 12px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  height: 200px;
}

/* 详情面板遮罩层 */
.detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99;
  display: none;
}

.chat-layout-desktop .detail-overlay {
  display: block;
  left: 300px;
}

.chat-layout-tablet .detail-overlay {
  display: block;
  left: 250px;
}

/* 左侧内容区域 */
.left-content-section {
  height: 100%;
  overflow: hidden;
}

/* 滚动条样式 */
.sidebar-content::-webkit-scrollbar,
.chat-main-messages::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track,
.chat-main-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb,
.chat-main-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover,
.chat-main-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
