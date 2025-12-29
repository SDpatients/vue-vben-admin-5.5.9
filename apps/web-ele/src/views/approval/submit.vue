<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { approvalApi, type ApprovalSubmitDTO } from '#/api/core/approval';
import { Icon } from '@iconify/vue';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElMessage, type FormInstance } from 'element-plus';

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = ref<ApprovalSubmitDTO>({
  type: '',
  applicantName: '',
  approverId: 0,
  approverName: '',
  title: '',
  description: '',
  businessData: {},
});

const approverOptions = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
]);

const handleApproverChange = (value: number) => {
  const approver = approverOptions.value.find((item) => item.id === value);
  if (approver) {
    form.value.approverName = approver.name;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await approvalApi.submitApproval(form.value);
        ElMessage.success('提交成功');
        router.push('/approval/list');
      } catch (error) {
        ElMessage.error('提交失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

const handleCancel = () => {
  router.back();
};

const rules = {
  type: [{ required: true, message: '请选择审核类型', trigger: 'change' }],
  applicantName: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  approverId: [{ required: true, message: '请选择审核人', trigger: 'change' }],
  title: [{ required: true, message: '请输入审核标题', trigger: 'blur' }],
};
</script>

<template>
  <div class="approval-submit-page">
    <div class="page-header">
      <ElButton :icon="Icon({ icon: 'lucide:arrow-left' })" @click="handleCancel">
        返回
      </ElButton>
      <h2>提交审核</h2>
      <div></div>
    </div>

    <div class="page-content">
      <ElCard shadow="hover">
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
          <ElFormItem label="审核类型" prop="type" required>
            <ElSelect v-model="form.type" placeholder="请选择审核类型" style="width: 100%">
              <ElOption label="案件审核" value="CASE" />
              <ElOption label="文书审核" value="DOCUMENT" />
              <ElOption label="信息审核" value="INFO" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="申请人" prop="applicantName" required>
            <ElInput v-model="form.applicantName" placeholder="请输入申请人姓名" />
          </ElFormItem>

          <ElFormItem label="审核人" prop="approverId" required>
            <ElSelect
              v-model="form.approverId"
              placeholder="请选择审核人"
              style="width: 100%"
              @change="handleApproverChange"
            >
              <ElOption
                v-for="item in approverOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审核标题" prop="title" required>
            <ElInput v-model="form.title" placeholder="请输入审核标题" />
          </ElFormItem>

          <ElFormItem label="审核描述" prop="description">
            <ElInput
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入审核描述"
            />
          </ElFormItem>

          <ElFormItem label="业务数据">
            <ElInput
              v-model="form.businessData"
              type="textarea"
              :rows="6"
              placeholder='请输入业务数据（JSON格式），例如：{"key": "value"}'
            />
          </ElFormItem>

          <ElFormItem>
            <div class="form-actions">
              <ElButton @click="handleCancel">取消</ElButton>
              <ElButton type="primary" :loading="loading" @click="handleSubmit">
                <Icon icon="lucide:send" :size="16" class="mr-1" />
                提交审核
              </ElButton>
            </div>
          </ElFormItem>
        </ElForm>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.approval-submit-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.mr-1 {
  margin-right: 4px;
}
</style>
