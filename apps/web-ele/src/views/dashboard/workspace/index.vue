<script lang="ts" setup>
import type { WorkbenchProjectItem, WorkbenchTodoItem } from '@vben/common-ui';

import type { Approval } from '#/api/core/approval';
import type { Todo } from '#/api/core/todo';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchTodo,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { approvalApi } from '#/api/core/approval';
import { getCaseListApi } from '#/api/core/case';
import { todoApi } from '#/api/core/todo';
import ActivityTimeline from '#/components/ActivityTimeline.vue';
import ApprovalCard from '#/components/ApprovalCard.vue';
import NotificationBadge from '#/components/NotificationBadge.vue';
import TodoList from '#/components/TodoList.vue';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();
const router = useRouter();

const pendingApprovals = ref<Approval[]>([]);
const todoItems = ref<WorkbenchTodoItem[]>([]);
const projectItems = ref<WorkbenchProjectItem[]>([]);
const loading = ref(false);

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

const loadTodoItems = async () => {
  try {
    const res = await todoApi.getTodoList('PENDING', undefined, 1, 5);
    const todos: Todo[] = res.data || [];
    todoItems.value = todos.map((item: Todo) => ({
      title: item.title,
      content: item.description || '暂无描述',
      date: item.deadline
        ? new Date(item.deadline).toLocaleDateString('zh-CN')
        : new Date().toLocaleDateString('zh-CN'),
      completed: item.status === 'COMPLETED',
    }));
  } catch (error) {
    console.error('加载待办事项失败:', error);
  }
};

const loadProjectItems = async () => {
  loading.value = true;
  try {
    const res = await getCaseListApi({ page: 1, size: 100 });
    const caseList = res.data?.records || [];
    const totalCount = caseList.length;

    projectItems.value = [
      {
        color: '#1890ff',
        content: `${totalCount} 个案件`,
        date: new Date().toLocaleDateString('zh-CN'),
        group: '管理',
        icon: 'ion:folder-open',
        title: '受理案件',
        url: '/case-management',
      },
    ];
  } catch (error) {
    console.error('加载案件数据失败:', error);
    projectItems.value = [
      {
        color: '#1890ff',
        content: '0 个案件',
        date: new Date().toLocaleDateString('zh-CN'),
        group: '管理',
        icon: 'ion:folder-open',
        title: '受理案件',
        url: '/case-management',
      },
    ];
  } finally {
    loading.value = false;
  }
};

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
loadTodoItems();
loadProjectItems();
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <span>早安, {{ userStore.userInfo?.realName }},
            开始您一天的工作吧！</span>
          <NotificationBadge />
        </div>
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject
          :items="projectItems"
          title="受理案件"
          @click="navTo"
        />
        <ActivityTimeline class="mt-5" title="最新动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" />
        <TodoList class="mt-5" title="待办事项管理" />
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
