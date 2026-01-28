<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { approvalApi, type CreateApprovalDTO } from '#/api/core/approval';
import { Icon } from '@iconify/vue';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElMessage, type FormInstance } from 'element-plus';

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = ref<CreateApprovalDTO>({
  caseId: 0,
  approvalType: '',
  approvalTitle: '',
  approvalContent: '',
  approvalAttachment: '',
  remark: '',
});

const caseOptions = ref([
  { id: 1, caseNumber: '案号001' },
  { id: 2, caseNumber: '案号002' },
  { id: 3, caseNumber: '案号003' },
]);

const handleCaseChange = (value: number) => {
  form.value.caseId = value;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await approvalApi.createApproval(form.value);
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
  caseId: [{ required: true, message: '请选择案件', trigger: 'change' }],
  approvalType: [{ required: true, message: '请选择审批类型', trigger: 'change' }],
  approvalTitle: [{ required: true, message: '请输入审批标题', trigger: 'blur' }],
  approvalContent: [{ required: true, message: '请输入审批内容', trigger: 'blur' }],
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
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
          <ElFormItem label="案件" prop="caseId" required>
            <ElSelect
              v-model="form.caseId"
              placeholder="请选择案件"
              style="width: 100%"
              @change="handleCaseChange"
            >
              <ElOption
                v-for="item in caseOptions"
                :key="item.id"
                :label="item.caseNumber"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审批类型" prop="approvalType" required>
            <ElSelect v-model="form.approvalType" placeholder="请选择审批类型" style="width: 100%">
              <ElOption label="案件提交审核" value="CASE_SUBMIT" />
              <ElOption label="案件结案" value="CASE_CLOSE" />
              <ElOption label="费用申请" value="FEE_APPLY" />
              <ElOption label="证据上传" value="EVIDENCE_UPLOAD" />
              <ElOption label="提交破产申请材料" value="TASK_001" />
              <ElOption label="法院立案形式审查" value="TASK_002" />
              <ElOption label="破产原因实质审查" value="TASK_003" />
              <ElOption label="同步选任管理人" value="TASK_004" />
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
          </ElFormItem>

          <ElFormItem label="审批标题" prop="approvalTitle" required>
            <ElInput v-model="form.approvalTitle" placeholder="请输入审批标题" />
          </ElFormItem>

          <ElFormItem label="审批内容" prop="approvalContent" required>
            <ElInput
              v-model="form.approvalContent"
              type="textarea"
              :rows="6"
              placeholder="请输入审批内容"
            />
          </ElFormItem>

          <ElFormItem label="审批附件" prop="approvalAttachment">
            <ElInput
              v-model="form.approvalAttachment"
              type="textarea"
              :rows="4"
              placeholder="请输入审批附件信息（JSON格式）"
            />
          </ElFormItem>

          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </ElFormItem>

          <ElFormItem>
            <div class="form-actions">
              <ElButton @click="handleCancel">取消</ElButton>
              <ElButton type="primary" :loading="loading" @click="handleSubmit">
                <Icon icon="lucide:send" :size="16" class="mr-1" />
                提交审批
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
  max-width: 800px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

.mr-1 {
  margin-right: 4px;
}
</style>
