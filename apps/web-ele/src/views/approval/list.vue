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
    res = await approvalApi.getApprovalList({ approvalStatus: status, approvalType: selectedType.value || undefined, pageNum: currentPage.value, pageSize: pageSize.value });
    approvals.value = res.data.list || [];
    hasMore.value = res.data.list.length >= pageSize.value;
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
    res = await approvalApi.getApprovalList({ approvalStatus: status, approvalType: selectedType.value || undefined, pageNum: currentPage.value, pageSize: pageSize.value });
    approvals.value = [...approvals.value, ...(res.data.list || [])];
    hasMore.value = res.data.list.length >= pageSize.value;
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
          style="width: 200px"
          placeholder="审核类型"
          clearable
          @change="handleTypeChange"
        >
          <ElOption label="案件提交审核" value="CASE_SUBMIT" />
          <ElOption label="案件结案" value="CASE_CLOSE" />
          <ElOption label="费用申请" value="FEE_APPLY" />
          <ElOption label="证据上传" value="EVIDENCE_UPLOAD" />
          <ElOption label="提交破产申请材料" value="TASK_001" />

          <ElOption label="裁定受理并公告" value="TASK_005" />
          <ElOption label="全面接管债务人" value="TASK_006" />
          <ElOption label="调查财产及经营状况" value="TASK_007" />
          <ElOption label="决定合同继续履行或解除" value="TASK_008" />
          <ElOption label="追收债务人财产" value="TASK_009" />
          <ElOption label="通知已知债权人并公告" value="TASK_010" />
          <ElOption label="接收、登记债权申报" value="TASK_011" />
          <ElOption label="审查申报债权并编制债权表" value="TASK_012" />
          <ElOption label="筹备第一次债权人会议" value="TASK_013" />
          <ElOption label="召开会议核查债权与议决事项" value="TASK_014" />
          <ElOption label="表决通过财产变价/分配方案" value="TASK_015" />
          <ElOption label="审查宣告破产条件" value="TASK_016" />
          <ElOption label="裁定宣告债务人破产" value="TASK_017" />
          <ElOption label="拟定并执行财产变价方案" value="TASK_018" />
          <ElOption label="执行破产财产分配" value="TASK_019" />
          <ElOption label="提请终结破产程序" value="TASK_020" />
          <ElOption label="法院裁定并公告" value="TASK_021" />
          <ElOption label="办理企业注销登记" value="TASK_022" />
          <ElOption label="管理人终止执行职务并归档" value="TASK_023" />
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
