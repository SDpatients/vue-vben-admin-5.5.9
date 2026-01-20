<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { approvalApi, type Approval } from '#/api/core/approval';
import ApprovalCard from '#/components/ApprovalCard.vue';
import { Icon } from '@iconify/vue';
import { ElButton, ElSelect, ElOption, ElTabs, ElTabPane, ElScrollbar, ElEmpty, ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const approvals = ref<Approval[]>([]);
const activeTab = ref('pending');
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const hasMore = ref(false);

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadApprovals = async (tab: string) => {
  loading.value = true;
  currentPage.value = 1;
  try {
    let res;
    const status = tab === 'pending' ? 'PENDING' : tab === 'approved' ? 'APPROVED' : tab === 'rejected' ? 'REJECTED' : 'CANCELLED';
    res = await approvalApi.getApprovalList(status, selectedType.value || undefined, currentPage.value, pageSize.value);
    approvals.value = res.data || [];
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error('加载审核列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  loading.value = true;
  currentPage.value++;
  try {
    let res;
    const status = activeTab.value === 'pending' ? 'PENDING' : activeTab.value === 'approved' ? 'APPROVED' : activeTab.value === 'rejected' ? 'REJECTED' : 'CANCELLED';
    res = await approvalApi.getApprovalList(status, selectedType.value || undefined, currentPage.value, pageSize.value);
    approvals.value = [...approvals.value, ...(res.data || [])];
    hasMore.value = res.data.length >= pageSize.value;
  } catch (error) {
    console.error('加载更多失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  loadApprovals(tab);
};

const handleTypeChange = () => {
  loadApprovals(activeTab.value);
};

const handleRefresh = () => {
  loadApprovals(activeTab.value);
};

const goToDetail = (id: number) => {
  router.push(`/approval/detail/${id}`);
};

const goToSubmit = () => {
  router.push('/approval/submit');
};

onMounted(() => {
  loadApprovals('pending');
});
</script>

<template>
  <div class="approval-list-page">
    <div class="page-header">
      <h2>审核管理</h2>
      <ElButton type="primary" @click="goToSubmit">
        <Icon icon="lucide:plus" :size="16" class="mr-1" />
        提交审核
      </ElButton>
    </div>

    <div class="page-content">
      <div class="filter-bar">
        <ElSelect
          v-model="selectedType"
          style="width: 150px"
          placeholder="审核类型"
          clearable
          @change="handleTypeChange"
        >
          <ElOption label="案件审核" value="CASE" />
          <ElOption label="文书审核" value="DOCUMENT" />
          <ElOption label="信息审核" value="INFO" />
        </ElSelect>
        <ElButton :icon="Icon({ icon: 'lucide:refresh-cw' })" @click="handleRefresh">
          刷新
        </ElButton>
      </div>

      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="待审核" name="pending">
          <div class="approval-list">
            <ElScrollbar max-height="600px">
              <div v-loading="loading">
                <ApprovalCard
                  v-for="approval in approvals"
                  :key="approval.id"
                  :approval="approval"
                  @refresh="handleRefresh"
                />
                <div v-if="hasMore" class="load-more">
                  <ElButton link @click="loadMore">加载更多</ElButton>
                </div>
                <ElEmpty v-if="approvals.length === 0 && !loading" description="暂无待审核任务" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
        <ElTabPane label="已通过" name="approved">
          <div class="approval-list">
            <ElScrollbar max-height="600px">
              <div v-loading="loading">
                <ApprovalCard
                  v-for="approval in approvals"
                  :key="approval.id"
                  :approval="approval"
                  :readonly="true"
                  @click="goToDetail(approval.id)"
                />
                <div v-if="hasMore" class="load-more">
                  <ElButton link @click="loadMore">加载更多</ElButton>
                </div>
                <ElEmpty v-if="approvals.length === 0 && !loading" description="暂无已通过的审核" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
        <ElTabPane label="已驳回" name="rejected">
          <div class="approval-list">
            <ElScrollbar max-height="600px">
              <div v-loading="loading">
                <ApprovalCard
                  v-for="approval in approvals"
                  :key="approval.id"
                  :approval="approval"
                  :readonly="true"
                  @click="goToDetail(approval.id)"
                />
                <div v-if="hasMore" class="load-more">
                  <ElButton link @click="loadMore">加载更多</ElButton>
                </div>
                <ElEmpty v-if="approvals.length === 0 && !loading" description="暂无已驳回的审核" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
        <ElTabPane label="已取消" name="cancelled">
          <div class="approval-list">
            <ElScrollbar max-height="600px">
              <div v-loading="loading">
                <ApprovalCard
                  v-for="approval in approvals"
                  :key="approval.id"
                  :approval="approval"
                  :readonly="true"
                  @click="goToDetail(approval.id)"
                />
                <div v-if="hasMore" class="load-more">
                  <ElButton link @click="loadMore">加载更多</ElButton>
                </div>
                <ElEmpty v-if="approvals.length === 0 && !loading" description="暂无已取消的审核" />
              </div>
            </ElScrollbar>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<style scoped>
.approval-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.approval-list {
  min-height: 400px;
}

.load-more {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

.mr-1 {
  margin-right: 4px;
}
</style>
