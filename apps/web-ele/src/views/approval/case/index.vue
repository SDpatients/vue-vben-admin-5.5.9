<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
} from 'element-plus';

interface CaseApproval {
  id: number;
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  plaintiff: string;
  defendant: string;
  submitter: string;
  submitTime: string;
  status: 'approved' | 'pending' | 'rejected';
  priority: 'high' | 'low' | 'medium';
  description: string;
  remark?: string;
  timeline?: TimelineItem[];
}

interface TimelineItem {
  time: string;
  content: string;
  type: 'info' | 'primary' | 'success' | 'warning';
}

const loading = ref(false);
const caseList = ref<CaseApproval[]>([]);
const dialogVisible = ref(false);
const currentCase = ref<CaseApproval | null>(null);
const approvalForm = ref({
  remark: '',
  status: 'approved' as 'approved' | 'rejected',
});

const searchForm = ref({
  status: '',
  caseType: '',
  priority: '',
  keyword: '',
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const caseTypes = [
  { label: '合同纠纷', value: 'contract' },
  { label: '劳动争议', value: 'labor' },
  { label: '房产纠纷', value: 'property' },
  { label: '侵权纠纷', value: 'tort' },
  { label: '婚姻家庭', value: 'family' },
  { label: '其他', value: 'other' },
];

const priorities = [
  { label: '高', value: 'high', type: 'danger' as const },
  { label: '中', value: 'medium', type: 'warning' as const },
  { label: '低', value: 'low', type: 'info' as const },
];

const statusMap = {
  pending: { text: '待审批', type: 'warning' as const },
  approved: { text: '已通过', type: 'success' as const },
  rejected: { text: '已驳回', type: 'danger' as const },
};

const mockData: CaseApproval[] = [
  {
    id: 1,
    caseNumber: 'CASE-2026-0001',
    caseTitle: '张三诉李四合同纠纷案',
    caseType: 'contract',
    plaintiff: '张三',
    defendant: '李四',
    submitter: '王律师',
    submitTime: '2026-01-07 14:30:00',
    status: 'pending',
    priority: 'high',
    description: '张三与李四签订的买卖合同存在违约行为，要求赔偿损失...',
    timeline: [
      { time: '2026-01-07 14:30:00', content: '案件提交', type: 'primary' },
      { time: '2026-01-07 15:00:00', content: '初审通过', type: 'success' },
    ],
  },
  {
    id: 2,
    caseNumber: 'CASE-2026-0002',
    caseTitle: '王五诉赵六劳动争议案',
    caseType: 'labor',
    plaintiff: '王五',
    defendant: '赵六公司',
    submitter: '李律师',
    submitTime: '2026-01-07 10:15:00',
    status: 'pending',
    priority: 'medium',
    description: '王五与赵六公司存在劳动争议，要求支付工资和赔偿金...',
    timeline: [
      { time: '2026-01-07 10:15:00', content: '案件提交', type: 'primary' },
    ],
  },
  {
    id: 3,
    caseNumber: 'CASE-2026-0003',
    caseTitle: '孙七诉周八房产纠纷案',
    caseType: 'property',
    plaintiff: '孙七',
    defendant: '周八',
    submitter: '张律师',
    submitTime: '2026-01-06 16:45:00',
    status: 'approved',
    priority: 'high',
    description: '孙七与周八的房产过户纠纷，要求完成过户手续...',
    remark: '材料齐全，符合审批条件',
    timeline: [
      { time: '2026-01-06 16:45:00', content: '案件提交', type: 'primary' },
      { time: '2026-01-06 17:00:00', content: '初审通过', type: 'success' },
      { time: '2026-01-06 18:30:00', content: '审批通过', type: 'success' },
    ],
  },
  {
    id: 4,
    caseNumber: 'CASE-2026-0004',
    caseTitle: '吴九诉郑十侵权纠纷案',
    caseType: 'tort',
    plaintiff: '吴九',
    defendant: '郑十',
    submitter: '赵律师',
    submitTime: '2026-01-06 09:20:00',
    status: 'rejected',
    priority: 'low',
    description: '吴九指控郑十侵犯其知识产权，要求停止侵权并赔偿...',
    remark: '证据不足，需要补充相关材料',
    timeline: [
      { time: '2026-01-06 09:20:00', content: '案件提交', type: 'primary' },
      { time: '2026-01-06 10:00:00', content: '初审驳回', type: 'warning' },
      { time: '2026-01-06 11:00:00', content: '审批驳回', type: 'danger' },
    ],
  },
  {
    id: 5,
    caseNumber: 'CASE-2026-0005',
    caseTitle: '陈十一诉刘十二婚姻家庭案',
    caseType: 'family',
    plaintiff: '陈十一',
    defendant: '刘十二',
    submitter: '孙律师',
    submitTime: '2026-01-05 15:30:00',
    status: 'pending',
    priority: 'medium',
    description: '陈十一与刘十二离婚纠纷，涉及财产分割和子女抚养权...',
    timeline: [
      { time: '2026-01-05 15:30:00', content: '案件提交', type: 'primary' },
    ],
  },
];

const loadCases = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    caseList.value = mockData;
    pagination.value.total = mockData.length;
  } catch {
    ElMessage.error('加载案件列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  loadCases();
};

const handleReset = () => {
  searchForm.value = {
    status: '',
    caseType: '',
    priority: '',
    keyword: '',
  };
  pagination.value.current = 1;
  loadCases();
};

const handleViewDetail = (row: CaseApproval) => {
  currentCase.value = row;
  dialogVisible.value = true;
};

const handleApprove = (row: CaseApproval) => {
  currentCase.value = row;
  approvalForm.value = {
    remark: '',
    status: 'approved',
  };
  dialogVisible.value = true;
};

const handleReject = (row: CaseApproval) => {
  currentCase.value = row;
  approvalForm.value = {
    remark: '',
    status: 'rejected',
  };
  dialogVisible.value = true;
};

const handleConfirmApproval = async () => {
  if (!currentCase.value) return;

  if (
    approvalForm.value.status === 'rejected' &&
    !approvalForm.value.remark.trim()
  ) {
    ElMessage.warning('驳回时必须填写审批意见');
    return;
  }

  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = caseList.value.findIndex(
      (c) => c.id === currentCase.value?.id,
    );
    if (index !== -1) {
      caseList.value[index].status = approvalForm.value.status;
      if (approvalForm.value.remark) {
        caseList.value[index].remark = approvalForm.value.remark;
      }

      const newTimeline: TimelineItem = {
        time: new Date().toLocaleString('zh-CN'),
        content:
          approvalForm.value.status === 'approved' ? '审批通过' : '审批驳回',
        type: approvalForm.value.status === 'approved' ? 'success' : 'danger',
      };

      if (!caseList.value[index].timeline) {
        caseList.value[index].timeline = [];
      }
      caseList.value[index].timeline!.push(newTimeline);
    }

    ElMessage.success(
      approvalForm.value.status === 'approved' ? '审批通过' : '已驳回',
    );
    dialogVisible.value = false;
  } catch {
    ElMessage.error('审批失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadCases();
};

const getCaseTypeName = (type: string) => {
  const item = caseTypes.find((t) => t.value === type);
  return item?.label || type;
};

const getPriorityInfo = (priority: string) => {
  const item = priorities.find((p) => p.value === priority);
  return item || { label: priority, type: 'info' as const };
};

onMounted(() => {
  loadCases();
});
</script>

<template>
  <div class="case-approval-page p-6">
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">案件审批</span>
          <ElButton type="primary" @click="loadCases">
            <i class="i-lucide-refresh-cw mr-1"></i>
            刷新
          </ElButton>
        </div>
      </template>

      <div class="mb-4">
        <ElForm :model="searchForm" inline>
          <ElFormItem label="案件类型">
            <ElSelect
              v-model="searchForm.caseType"
              placeholder="请选择案件类型"
              clearable
              style="width: 150px"
            >
              <ElOption
                v-for="type in caseTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="优先级">
            <ElSelect
              v-model="searchForm.priority"
              placeholder="请选择优先级"
              clearable
              style="width: 120px"
            >
              <ElOption
                v-for="p in priorities"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审批状态">
            <ElSelect
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <ElOption
                v-for="(item, key) in statusMap"
                :key="key"
                :label="item.text"
                :value="key"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="关键词">
            <ElInput
              v-model="searchForm.keyword"
              placeholder="请输入案号、标题或当事人"
              clearable
              style="width: 220px"
            />
          </ElFormItem>

          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">
              <i class="i-lucide-search mr-1"></i>
              查询
            </ElButton>
            <ElButton @click="handleReset">
              <i class="i-lucide-rotate-ccw mr-1"></i>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <ElTable
        :data="caseList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <ElTableColumn label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </ElTableColumn>

        <ElTableColumn prop="caseNumber" label="案号" width="150" />

        <ElTableColumn prop="caseTitle" label="案件标题" min-width="220">
          <template #default="{ row }">
            <ElTooltip :content="row.caseTitle" placement="top">
              <span class="truncate-text">{{ row.caseTitle }}</span>
            </ElTooltip>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="caseType" label="案件类型" width="110">
          <template #default="{ row }">
            <ElTag type="info" size="small">
              {{ getCaseTypeName(row.caseType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="getPriorityInfo(row.priority).type" size="small">
              {{ getPriorityInfo(row.priority).label }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="plaintiff" label="原告" width="100" />

        <ElTableColumn prop="defendant" label="被告" width="100" />

        <ElTableColumn prop="submitter" label="提交人" width="100" />

        <ElTableColumn prop="submitTime" label="提交时间" width="170" />

        <ElTableColumn
          prop="status"
          label="审批状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="statusMap[row.status].type" size="small">
              {{ statusMap[row.status].text }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              <i class="i-lucide-eye mr-1"></i>
              查看详情
            </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              link
              @click="handleApprove(row)"
            >
              <i class="i-lucide-check mr-1"></i>
              通过
            </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              link
              @click="handleReject(row)"
            >
              <i class="i-lucide-x mr-1"></i>
              驳回
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div v-if="caseList.length === 0 && !loading" class="mt-8">
        <ElEmpty description="暂无案件审批数据" />
      </div>

      <div v-if="caseList.length > 0" class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="currentCase?.status === 'pending' ? '审批案件' : '案件详情'"
      width="800px"
    >
      <div v-if="currentCase" class="case-detail">
        <ElForm :model="currentCase" label-width="100px">
          <div class="basic-info">
            <div class="info-row">
              <ElFormItem label="案号">
                <span class="detail-value">{{ currentCase.caseNumber }}</span>
              </ElFormItem>
              <ElFormItem label="案件类型">
                <ElTag type="info" size="small">
                  {{ getCaseTypeName(currentCase.caseType) }}
                </ElTag>
              </ElFormItem>
              <ElFormItem label="优先级">
                <ElTag
                  :type="getPriorityInfo(currentCase.priority).type"
                  size="small"
                >
                  {{ getPriorityInfo(currentCase.priority).label }}
                </ElTag>
              </ElFormItem>
              <ElFormItem label="审批状态">
                <ElTag :type="statusMap[currentCase.status].type" size="small">
                  {{ statusMap[currentCase.status].text }}
                </ElTag>
              </ElFormItem>
            </div>
          </div>

          <ElFormItem label="案件标题">
            <span class="detail-value">{{ currentCase.caseTitle }}</span>
          </ElFormItem>

          <div class="parties-info">
            <ElFormItem label="原告">
              <span class="detail-value">{{ currentCase.plaintiff }}</span>
            </ElFormItem>
            <ElFormItem label="被告">
              <span class="detail-value">{{ currentCase.defendant }}</span>
            </ElFormItem>
          </div>

          <ElFormItem label="提交人">
            <span class="detail-value">{{ currentCase.submitter }}</span>
          </ElFormItem>

          <ElFormItem label="提交时间">
            <span class="detail-value">{{ currentCase.submitTime }}</span>
          </ElFormItem>

          <ElFormItem label="案件描述">
            <div class="content-box">
              {{ currentCase.description }}
            </div>
          </ElFormItem>

          <ElFormItem
            v-if="currentCase.timeline && currentCase.timeline.length > 0"
            label="案件时间线"
          >
            <div class="timeline-box">
              <ElTimeline>
                <ElTimelineItem
                  v-for="(item, index) in currentCase.timeline"
                  :key="index"
                  :type="item.type"
                  :timestamp="item.time"
                  placement="top"
                >
                  {{ item.content }}
                </ElTimelineItem>
              </ElTimeline>
            </div>
          </ElFormItem>

          <ElFormItem v-if="currentCase.remark" label="审批意见">
            <div class="remark-box">
              {{ currentCase.remark }}
            </div>
          </ElFormItem>

          <ElFormItem v-if="currentCase.status === 'pending'" label="审批意见">
            <ElInput
              v-model="approvalForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见（驳回时必填）"
            />
          </ElFormItem>
        </ElForm>
      </div>

      <template #footer v-if="currentCase?.status === 'pending'">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="success"
          :loading="loading"
          @click="
            approvalForm.status = 'approved';
            handleConfirmApproval();
          "
        >
          <i class="i-lucide-check mr-1"></i>
          通过
        </ElButton>
        <ElButton
          type="danger"
          :loading="loading"
          @click="
            approvalForm.status = 'rejected';
            handleConfirmApproval();
          "
        >
          <i class="i-lucide-x mr-1"></i>
          驳回
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.case-approval-page {
  .truncate-text {
    display: inline-block;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .case-detail {
    .basic-info {
      .info-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 4px;
      }
    }

    .parties-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .detail-value {
      color: #303133;
      font-weight: 500;
    }

    .content-box {
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
      color: #606266;
      min-height: 80px;
    }

    .remark-box {
      padding: 12px;
      background-color: #fef0f0;
      border-radius: 4px;
      line-height: 1.6;
      color: #f56c6c;
    }

    .timeline-box {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
