<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
} from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';
import NotificationBadge from '#/components/NotificationBadge.vue';
import ActivityTimeline from '#/components/ActivityTimeline.vue';
import TodoList from '#/components/TodoList.vue';
import ApprovalCard from '#/components/ApprovalCard.vue';
import { approvalApi, type Approval } from '#/api/core/approval';

const userStore = useUserStore();
const router = useRouter();

const pendingApprovals = ref<Approval[]>([]);

const loadPendingApprovals = async () => {
  try {
    const res = await approvalApi.getPendingApprovals(1, 5);
    pendingApprovals.value = res.data || [];
  } catch (error) {
    console.error('加载待审核失败:', error);
  }
};

const handleApprovalRefresh = () => {
  loadPendingApprovals();
};

const goToApprovalList = () => {
  router.push('/approval/list');
};

const goToApprovalDetail = (id: number) => {
  router.push(`/approval/detail/${id}`);
};

const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    group: '开源组',
    icon: 'carbon:logo-github',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    group: '算法组',
    icon: 'ion:logo-vue',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    group: '上班摸鱼',
    icon: 'ion:logo-html5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: '热情和欲望可以突破一切难关。',
    date: '2021-04-01',
    group: 'UI',
    icon: 'ion:logo-angular',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: '健康的身体是实现目标的基石。',
    date: '2021-04-01',
    group: '技术牛',
    icon: 'bx:bxl-react',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#EBD94E',
    content: '路是走出来的，而不是空想出来的。',
    date: '2021-04-01',
    group: '架构组',
    icon: 'ion:logo-javascript',
    title: 'Js',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  },
];

const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '仪表盘',
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: '组件',
    url: '/demos/features/icons',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: '系统管理',
    url: '/demos/features/login-expired',
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: '权限管理',
    url: '/demos/access/page-control',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '图表',
    url: '/analytics',
  },
];

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}

loadPendingApprovals();
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <span>早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！</span>
          <NotificationBadge />
        </div>
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo" />
        <ActivityTimeline class="mt-5" title="最新动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <TodoList class="mt-5" title="待办事项" />
        <div class="mt-5">
          <AnalysisChartCard title="待审核">
            <div v-if="pendingApprovals.length > 0" class="pending-approvals">
              <ApprovalCard
                v-for="approval in pendingApprovals"
                :key="approval.id"
                :approval="approval"
                @refresh="handleApprovalRefresh"
                @click="goToApprovalDetail(approval.id)"
              />
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-text">暂无待审核任务</div>
            </div>
            <div v-if="pendingApprovals.length > 0" class="view-more">
              <button class="view-more-btn" @click="goToApprovalList">
                查看全部
              </button>
            </div>
          </AnalysisChartCard>
        </div>
        <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-approvals {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.view-more {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.view-more-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background-color: #ecf5ff;
}
</style>
