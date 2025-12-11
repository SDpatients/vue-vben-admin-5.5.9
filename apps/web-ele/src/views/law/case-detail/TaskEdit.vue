<script setup lang="ts">
import type { CaseProcessApi } from '#/api/core/case-process';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElRow,
  ElSelect,
  ElTag,
} from 'element-plus';

import {
  getBusinessManagementApi,
  getEmergencyApi,
  getInternalAffairsApi,
  getLegalProcedureApi,
  getManagementApi,
  getPersonnelEmpApi,
  getPropertyPlanApi,
  getPropertyReceiptApi,
  getSealManagementApi,
  getWorkPlanApi,
  getWorkTeamApi,
  updateTaskStatusApi,
} from '#/api/core/case-process';

// 路由和状态管理
const route = useRoute();
const router = useRouter();

const caseId = ref(route.params.caseId as string);
const taskId = ref(route.params.taskId as string);

// 任务配置
const taskConfigs = {
  workTeam: {
    name: '工作团队确认',
    fields: [
      { key: 'TDID', label: '团队ID', type: 'input' },
      { key: 'TDFZR', label: '团队负责人', type: 'input' },
      { key: 'ZHZCY', label: '综合组成员', type: 'input' },
      { key: 'CXZCY', label: '程序组成员', type: 'input' },
      { key: 'CCGLZCY', label: '财产管理组成员', type: 'input' },
      { key: 'ZQSHZCY', label: '债权审核组成员', type: 'input' },
      { key: 'LDRSZCY', label: '劳动人事组成员', type: 'input' },
      { key: 'ZZQLZCY', label: '债权确认组成员', type: 'input' },
    ],
    apiUrl: '/api/web/getWorkTeam',
    token: '4015f285dc41bd1bb931ba8430966c3f',
  },
  workPlan: {
    name: '工作计划确认',
    fields: [
      { key: 'JHID', label: '计划ID', type: 'input' },
      { key: 'JHLX', label: '计划类型', type: 'input' },
      { key: 'JHNR', label: '计划内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'ZHZT', label: '综合状态', type: 'input' },
    ],
    apiUrl: '/api/web/getWorkPlan',
    token: '8a62e323a84173fd8ec72557e6fc616d',
  },
  management: {
    name: '管理制度确认',
    fields: [
      { key: 'GLID', label: '管理制度ID', type: 'input' },
      { key: 'GLMC', label: '管理制度名称', type: 'input' },
      { key: 'GLNR', label: '管理制度内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'FBRQ', label: '发布日期', type: 'date' },
      { key: 'SYFW', label: '适用范围', type: 'input' },
    ],
    apiUrl: '/api/web/getManagement',
    token: '6bbdf0bf97117c1bac495072c961e778',
  },
  sealManagement: {
    name: '印章确认',
    fields: [
      { key: 'YZID', label: '印章ID', type: 'input' },
      { key: 'YZMC', label: '印章名称', type: 'input' },
      {
        key: 'YZZT',
        label: '印章状态',
        type: 'select',
        options: ['正常', '停用', '销毁'],
      },
      { key: 'GLR', label: '管理人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getSealManagement',
    token: '203cadf061d22b2aaa2ce1c59b9c4bbb',
  },
  legalProcedure: {
    name: '法律程序确认',
    fields: [
      { key: 'CXID', label: '程序ID', type: 'input' },
      { key: 'CXMC', label: '程序名称', type: 'input' },
      { key: 'CXNR', label: '程序内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      {
        key: 'CXZT',
        label: '程序状态',
        type: 'select',
        options: ['进行中', '已完成', '已终止'],
      },
    ],
    apiUrl: '/api/web/getLegalProcedure',
    token: 'a81a3a18b6d52abb4b6c38132e1198da',
  },
  // 第二阶段任务配置
  propertyReceipt: {
    name: '财产接管确认',
    fields: [
      { key: 'CCJGID', label: '财产接管ID', type: 'input' },
      { key: 'CCJGRQ', label: '接管日期', type: 'date' },
      { key: 'CCJGNR', label: '接管内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'JGZT', label: '接管状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getPropertyReceipt',
    token: '699a11d9338b983ce9eafc5e75f1833f',
  },
  emergency: {
    name: '应急预案确认',
    fields: [
      { key: 'YJYAID', label: '应急预案ID', type: 'input' },
      { key: 'YJYAMC', label: '应急预案名称', type: 'input' },
      { key: 'YJYANR', label: '应急预案内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'YJZT', label: '应急状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getEmergency',
    token: 'c6c85c5e695fec908ded4f05f9e9bfc9',
  },
  propertyPlan: {
    name: '财产处置计划确认',
    fields: [
      { key: 'CCJHID', label: '财产计划ID', type: 'input' },
      { key: 'CCJHMC', label: '财产计划名称', type: 'input' },
      { key: 'CCJHNR', label: '财产计划内容', type: 'textarea' },
      { key: 'KSRQ', label: '开始日期', type: 'date' },
      { key: 'JSRQ', label: '结束日期', type: 'date' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'JHZT', label: '计划状态', type: 'input' },
    ],
    apiUrl: '/api/web/getPropertyPlan',
    token: '924180f974b81f375d6625ab0fd59f60',
  },
  personnelEmp: {
    name: '人事管理确认',
    fields: [
      { key: 'RSGLID', label: '人事管理ID', type: 'input' },
      { key: 'RSGLNR', label: '人事管理内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'GLZT', label: '管理状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getPersonnelEmp',
    token: 'ae3987ea39249e94edb9bdccf1c859d7',
  },
  internalAffairs: {
    name: '内部事务确认',
    fields: [
      { key: 'NBSWID', label: '内部事务ID', type: 'input' },
      { key: 'NBSWNR', label: '内部事务内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'CLRQ', label: '处理日期', type: 'date' },
      { key: 'SWZT', label: '事务状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getInternalAffairs',
    token: 'ba251b8fffee8a47a71b3429ab9cccb5',
  },
  businessManagement: {
    name: '经营管理确认',
    fields: [
      { key: 'JYGLID', label: '经营管理ID', type: 'input' },
      { key: 'JYGLNR', label: '经营管理内容', type: 'textarea' },
      { key: 'FZR', label: '负责人', type: 'input' },
      { key: 'GLRQ', label: '管理日期', type: 'date' },
      { key: 'GLZT', label: '管理状态', type: 'input' },
      { key: 'BZ', label: '备注', type: 'textarea' },
    ],
    apiUrl: '/api/web/getBusinessManagement',
    token: '0611b92b9a4bd76e5fc315d145a90fc2',
  },
};

// 当前任务配置
const currentTask = computed(
  () => taskConfigs[taskId.value as keyof typeof taskConfigs],
);

// 表单数据
const formData = ref<Record<string, any>>({});
const originalData = ref<Record<string, any>>({});
const loading = ref(false);
const saving = ref(false);

// 状态管理
const taskStatus = ref<CaseProcessApi.TaskStatus>('未确认');

// 获取状态标签类型
const getStatusType = (status: CaseProcessApi.TaskStatus) => {
  switch (status) {
    case '完成': {
      return 'success';
    }
    case '跳过': {
      return 'warning';
    }
    default: {
      return 'info';
    }
  }
};

// 加载任务数据
const loadTaskData = async () => {
  loading.value = true;
  try {
    // 根据任务类型调用对应的API
    let apiResponse: any;

    switch (taskId.value) {
      case 'businessManagement': {
        apiResponse = await getBusinessManagementApi(caseId.value);
        break;
      }
      case 'emergency': {
        apiResponse = await getEmergencyApi(caseId.value);
        break;
      }
      case 'internalAffairs': {
        apiResponse = await getInternalAffairsApi(caseId.value);
        break;
      }
      case 'legalProcedure': {
        apiResponse = await getLegalProcedureApi(caseId.value);
        break;
      }
      case 'management': {
        apiResponse = await getManagementApi(caseId.value);
        break;
      }
      case 'personnelEmp': {
        apiResponse = await getPersonnelEmpApi(caseId.value);
        break;
      }
      case 'propertyPlan': {
        apiResponse = await getPropertyPlanApi(caseId.value);
        break;
      }
      // 第二阶段任务类型
      case 'propertyReceipt': {
        apiResponse = await getPropertyReceiptApi(caseId.value);
        break;
      }
      case 'sealManagement': {
        apiResponse = await getSealManagementApi(caseId.value);
        break;
      }
      case 'workPlan': {
        apiResponse = await getWorkPlanApi(caseId.value);
        break;
      }
      case 'workTeam': {
        apiResponse = await getWorkTeamApi(caseId.value);
        break;
      }
      default: {
        throw new Error('未知的任务类型');
      }
    }

    if (apiResponse.status === '1') {
      // 使用API返回的数据
      formData.value = { ...apiResponse.data };
      originalData.value = { ...apiResponse.data };

      // 设置任务状态，DQZT为空时默认为'未确认'
      taskStatus.value =
        (apiResponse.data?.DQZT as CaseProcessApi.TaskStatus) || '未确认';
    } else {
      // API调用失败，使用默认数据
      const mockData: Record<string, any> = {};
      currentTask.value.fields.forEach((field) => {
        mockData[field.key] = '';
      });

      formData.value = { ...mockData };
      originalData.value = { ...mockData };
      taskStatus.value = '未确认';

      ElMessage.warning('获取任务数据失败，使用默认数据');
    }
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');

    // 出错时使用默认数据
    const mockData: Record<string, any> = {};
    currentTask.value.fields.forEach((field) => {
      mockData[field.key] = '';
    });

    formData.value = { ...mockData };
    originalData.value = { ...mockData };
    taskStatus.value = '未确认';
  } finally {
    loading.value = false;
  }
};

// 保存数据
const saveData = async (confirm: boolean = false) => {
  saving.value = true;
  try {
    // 检查数据是否有变化
    const hasChanges =
      JSON.stringify(formData.value) !== JSON.stringify(originalData.value);

    if (!hasChanges && !confirm) {
      ElMessage.warning('没有数据需要保存');
      return;
    }

    // 更新任务状态（如果确认完成）
    if (confirm) {
      const result = await updateTaskStatusApi(
        taskId.value,
        caseId.value,
        '完成',
      );
      if (result.status === '1') {
        taskStatus.value = '完成';
        ElMessage.success('数据已保存并确认完成');
      } else {
        throw new Error('更新任务状态失败');
      }
    } else {
      // 只保存数据，不更新状态
      // 这里应该调用对应的数据更新API
      // 暂时模拟成功
      await new Promise((resolve) => setTimeout(resolve, 500));
      ElMessage.success('数据已保存');
    }

    // 更新原始数据
    originalData.value = { ...formData.value };
  } catch (error) {
    console.error('保存数据失败:', error);
    ElMessage.error('保存数据失败');
  } finally {
    saving.value = false;
  }
};

// 保存并确认
const saveAndConfirm = async () => {
  await ElMessageBox.confirm('确认保存并完成此任务吗？', '确认完成', {
    confirmButtonText: '确认完成',
    cancelButtonText: '取消',
    type: 'warning',
  });

  await saveData(true);
};

// 取消编辑
const cancelEdit = () => {
  // 检查是否有未保存的更改
  const hasChanges =
    JSON.stringify(formData.value) !== JSON.stringify(originalData.value);

  if (hasChanges) {
    ElMessageBox.confirm('有未保存的更改，确定要取消吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '继续编辑',
      type: 'warning',
    })
      .then(() => {
        router.back();
      })
      .catch(() => {
        // 用户选择继续编辑
      });
  } else {
    router.back();
  }
};

// 渲染表单字段
const renderFormField = (field: any) => {
  const { key, label, type, options } = field;

  // 安全地访问formData.value
  const fieldValue = formData.value[key] || '';

  const fieldConfigs: Record<string, any> = {
    date: () => ({
      component: ElDatePicker,
      props: {
        placeholder: `请选择${label}`,
        style: { width: '100%' },
        type: 'date',
        'onUpdate:modelValue': (value: any) => (formData.value[key] = value),
      },
      modelValue: fieldValue,
    }),
    select: () => ({
      component: ElSelect,
      props: {
        placeholder: `请选择${label}`,
        style: { width: '100%' },
        'onUpdate:modelValue': (value: any) => (formData.value[key] = value),
      },
      modelValue: fieldValue,
      children:
        options?.map((opt: string) => ({
          component: ElOption,
          props: {
            key: opt,
            label: opt,
            value: opt,
          },
        })) || [],
    }),
    textarea: () => ({
      component: ElInput,
      props: {
        placeholder: `请输入${label}`,
        rows: 4,
        type: 'textarea',
        'onUpdate:modelValue': (value: any) => (formData.value[key] = value),
      },
      modelValue: fieldValue,
    }),
    default: () => ({
      component: ElInput,
      props: {
        placeholder: `请输入${label}`,
        'onUpdate:modelValue': (value: any) => (formData.value[key] = value),
      },
      modelValue: fieldValue,
    }),
  };

  const fieldType = type || 'default';
  return fieldConfigs[fieldType]
    ? fieldConfigs[fieldType]()
    : fieldConfigs.default();
};

// 页面加载时获取数据
onMounted(() => {
  if (!currentTask.value) {
    ElMessage.error('无效的任务类型');
    router.back();
    return;
  }

  loadTaskData();
});
</script>

<template>
  <div class="task-edit-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <ElButton type="primary" link @click="cancelEdit">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件详情
      </ElButton>
      <h1 class="page-title">{{ currentTask?.name }}</h1>
      <div class="status-display">
        <ElTag :type="getStatusType(taskStatus)" size="large">
          {{ taskStatus }}
        </ElTag>
      </div>
    </div>

    <ElCard class="task-edit-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:edit-3" class="mr-2 text-blue-500" />
          <span class="text-lg font-semibold">
            {{ currentTask?.name }} - 编辑
          </span>
        </div>
      </template>

      <div v-if="currentTask" class="task-form">
        <ElForm :model="formData" label-width="120px">
          <ElRow :gutter="20">
            <ElCol
              v-for="field in currentTask.fields"
              :key="field.key"
              :xs="24"
              :sm="12"
              :md="8"
            >
              <ElFormItem :label="field.label" :prop="field.key">
                <component
                  :is="renderFormField(field).component"
                  v-bind="renderFormField(field).props"
                  v-model="renderFormField(field).modelValue"
                >
                  <template v-if="renderFormField(field).children">
                    <component
                      v-for="child in renderFormField(field).children"
                      :key="child.props.key"
                      :is="child.component"
                      v-bind="child.props"
                    />
                  </template>
                </component>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <ElButton type="default" @click="cancelEdit" :disabled="saving">
            <Icon icon="lucide:x" class="mr-1" />
            取消
          </ElButton>

          <ElButton type="primary" @click="saveData(false)" :loading="saving">
            <Icon icon="lucide:save" class="mr-1" />
            保存
          </ElButton>

          <ElButton
            type="success"
            @click="saveAndConfirm"
            :loading="saving"
            :disabled="taskStatus === '完成'"
          >
            <Icon icon="lucide:check-circle" class="mr-1" />
            保存并确认
          </ElButton>
        </div>
      </div>

      <div v-else class="error-container">
        <div class="error-message">
          <Icon icon="lucide:alert-circle" class="mr-2 text-red-500" />
          <span>无效的任务类型</span>
        </div>
      </div>
    </ElCard>

    <!-- 任务信息卡片 -->
    <ElCard class="task-info-card">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:info" class="mr-2 text-green-500" />
          <span class="text-lg font-semibold">任务说明</span>
        </div>
      </template>

      <div class="task-info-content">
        <p class="task-description">
          当前任务：<strong>{{ currentTask?.name }}</strong>
        </p>
        <p class="task-status-info">
          当前状态：<ElTag :type="getStatusType(taskStatus)">
            {{ taskStatus }}
          </ElTag>
        </p>
        <p class="task-instruction">
          • 点击"保存"按钮仅保存表单数据，不会改变任务状态
        </p>
        <p class="task-instruction">
          • 点击"保存并确认"按钮将保存数据并将任务状态设置为"完成"
        </p>
        <p class="task-instruction">
          • 如需跳过此任务，请在案件详情页面点击"跳过"按钮
        </p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.task-edit-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.status-display {
  margin-left: auto;
}

.task-edit-card,
.task-info-card {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.task-form {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.error-container {
  padding: 40px 20px;
  text-align: center;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #dc2626;
}

.task-info-content {
  padding: 16px;
}

.task-description,
.task-status-info,
.task-instruction {
  margin-bottom: 12px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.task-instruction {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-edit-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .status-display {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
