<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCol,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload,
} from 'element-plus';

import {
  addClaimApi,
  batchImportClaimsApi,
  exportClaimsApi,
  getClaimsApi,
} from '#/api/core/claim';

const props = defineProps<{
  caseId: string;
}>();

const loading = ref(false);
const claims = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const showAddDialog = ref(false);
const addLoading = ref(false);
const showImportDialog = ref(false);
const importLoading = ref(false);

const claimForm = reactive({
  caseName: '',
  debtor: '',
  account: '',
  creditorName: '',
  creditorType: '',
  creditCode: '',
  legalRepresentative: '',
  serviceAddress: '',
  agentName: '',
  agentPhone: '',
  agentIdCard: '',
  agentAddress: '',
  accountName: '',
  bankAccount: '',
  bankName: '',
  principal: '',
  interest: '',
  penalty: '',
  otherLosses: '',
  totalAmount: '',
  hasCourtJudgment: false,
  hasExecution: false,
  hasCollateral: false,
  claimNature: '',
  claimType: '',
  claimFacts: '',
  creditorCategory: '',
  claimNatureManager: '',
  claimIdentifier: '',
  evidenceList: '',
  evidenceMaterials: '',
  evidenceAttachments: [],
  remarks: '',
  registrationStatus: 'PENDING',
});

const fileList = ref<any[]>([]);

const totalAmount = computed(() => {
  const principal = Number.parseFloat(claimForm.principal) || 0;
  const interest = Number.parseFloat(claimForm.interest) || 0;
  const penalty = Number.parseFloat(claimForm.penalty) || 0;
  const otherLosses = Number.parseFloat(claimForm.otherLosses) || 0;
  return (principal + interest + penalty + otherLosses).toFixed(2);
});

const fetchClaims = async () => {
  loading.value = true;
  try {
    const response = await getClaimsApi(
      props.caseId,
      currentPage.value,
      pageSize.value,
    );
    if (response.status === '1') {
      claims.value = response.data.records || [];
      total.value = response.data.count || 0;
    } else {
      ElMessage.error(`获取债权登记表失败：${response.error || '未知错误'}`);
      claims.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取债权登记表失败:', error);
    ElMessage.error('获取债权登记表失败');
    claims.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchClaims();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchClaims();
};

const openAddDialog = () => {
  showAddDialog.value = true;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  resetForm();
};

const resetForm = () => {
  claimForm.caseName = '';
  claimForm.debtor = '';
  claimForm.account = '';
  claimForm.creditorName = '';
  claimForm.creditorType = '';
  claimForm.creditCode = '';
  claimForm.legalRepresentative = '';
  claimForm.serviceAddress = '';
  claimForm.agentName = '';
  claimForm.agentPhone = '';
  claimForm.agentIdCard = '';
  claimForm.agentAddress = '';
  claimForm.accountName = '';
  claimForm.bankAccount = '';
  claimForm.bankName = '';
  claimForm.principal = '';
  claimForm.interest = '';
  claimForm.penalty = '';
  claimForm.otherLosses = '';
  claimForm.totalAmount = '';
  claimForm.hasCourtJudgment = false;
  claimForm.hasExecution = false;
  claimForm.hasCollateral = false;
  claimForm.claimNature = '';
  claimForm.claimType = '';
  claimForm.claimFacts = '';
  claimForm.creditorCategory = '';
  claimForm.claimNatureManager = '';
  claimForm.claimIdentifier = '';
  claimForm.evidenceList = '';
  claimForm.evidenceMaterials = '';
  claimForm.evidenceAttachments = [];
  claimForm.remarks = '';
  claimForm.registrationStatus = 'PENDING';
  fileList.value = [];
};

const handleAddClaim = async () => {
  if (!claimForm.creditorName) {
    ElMessage.warning('请输入债权人姓名或名称');
    return;
  }

  addLoading.value = true;
  try {
    const formData = {
      ...claimForm,
      totalAmount: totalAmount.value,
      caseId: props.caseId,
    };

    const response = await addClaimApi(formData);
    if (response.status === '1') {
      ElMessage.success('债权登记成功');
      await fetchClaims();
      closeAddDialog();
    } else {
      ElMessage.error(`债权登记失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('债权登记失败:', error);
    ElMessage.error('债权登记失败');
  } finally {
    addLoading.value = false;
  }
};

const openImportDialog = () => {
  showImportDialog.value = true;
};

const closeImportDialog = () => {
  showImportDialog.value = false;
  fileList.value = [];
};

const handleFileChange = (file: any) => {
  fileList.value = [file];
};

const handleImport = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }

  importLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', fileList.value[0].raw);
    formData.append('caseId', props.caseId);

    const response = await batchImportClaimsApi(formData);
    if (response.status === '1') {
      ElMessage.success(`成功导入${response.data.count || 0}条债权记录`);
      await fetchClaims();
      closeImportDialog();
    } else {
      ElMessage.error(`导入失败：${response.error || '未知错误'}`);
    }
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败');
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  try {
    const response = await exportClaimsApi(props.caseId);
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = `债权登记表_${props.caseId}_${Date.now()}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error: any) {
    ElMessage.error(`导出失败：${error.message || '未知错误'}`);
  }
};

const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待审核' },
    APPROVED: { type: 'success', text: '已通过' },
    REJECTED: { type: 'danger', text: '已驳回' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

onMounted(() => {
  fetchClaims();
});
</script>

<template>
  <div class="claim-registration-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <div class="flex items-center">
            <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
            <span class="text-lg font-semibold">债权登记表</span>
          </div>
          <div class="flex space-x-2">
            <ElButton type="primary" @click="openAddDialog">
              <Icon icon="lucide:plus" class="mr-1" />
              新增
            </ElButton>
            <ElButton type="success" @click="openImportDialog">
              <Icon icon="lucide:upload" class="mr-1" />
              批量导入
            </ElButton>
            <ElButton type="info" @click="handleExport">
              <Icon icon="lucide:download" class="mr-1" />
              一键导出
            </ElButton>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="claim-list-container">
        <ElTable :data="claims" border stripe style="width: 100%" class="mb-4">
          <ElTableColumn
            prop="creditorName"
            label="债权人姓名或名称"
            min-width="180"
          />
          <ElTableColumn prop="creditorType" label="债权人类型" width="120" />
          <ElTableColumn
            prop="creditCode"
            label="统一社会信用代码"
            width="180"
          />
          <ElTableColumn prop="principal" label="申报本金" width="120" />
          <ElTableColumn prop="interest" label="申报利息" width="120" />
          <ElTableColumn prop="totalAmount" label="申报总金额" width="120" />
          <ElTableColumn prop="claimNature" label="债权性质" width="120" />
          <ElTableColumn prop="claimType" label="债权种类" width="120" />
          <ElTableColumn prop="registrationStatus" label="登记状态" width="100">
            <template #default="scope">
              <ElTag
                :type="
                  getRegistrationStatusTag(scope.row.registrationStatus).type
                "
                size="small"
              >
                {{
                  getRegistrationStatusTag(scope.row.registrationStatus).text
                }}
              </ElTag>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="total > 0" class="pagination-container flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>

        <div v-if="claims.length === 0 && !loading" class="empty-state">
          <ElEmpty description="暂无债权登记信息" />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="showAddDialog"
      title="新增债权登记"
      width="90%"
      destroy-on-close
    >
      <div class="add-dialog-container">
        <ElForm label-width="180px">
          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="案件名称">
                <ElInput
                  v-model="claimForm.caseName"
                  placeholder="请输入案件名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债务人">
                <ElSelect
                  v-model="claimForm.debtor"
                  placeholder="请选择债务人"
                  style="width: 100%"
                >
                  <ElOption label="债务人1" value="debtor1" />
                  <ElOption label="债务人2" value="debtor2" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账号">
                <ElInput v-model="claimForm.account" placeholder="请输入账号" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权人姓名或名称">
                <ElInput
                  v-model="claimForm.creditorName"
                  placeholder="请输入债权人姓名或名称"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人类型">
                <ElSelect
                  v-model="claimForm.creditorType"
                  placeholder="请选择债权人类型"
                  style="width: 100%"
                >
                  <ElOption label="金融机构" value="金融机构" />
                  <ElOption label="企业" value="企业" />
                  <ElOption label="个人" value="个人" />
                  <ElOption label="其他" value="其他" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="统一社会信用代码">
                <ElInput
                  v-model="claimForm.creditCode"
                  placeholder="请输入统一社会信用代码"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="法定代表人">
                <ElInput
                  v-model="claimForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="送达地址">
                <ElInput
                  v-model="claimForm.serviceAddress"
                  placeholder="请输入送达地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人姓名">
                <ElInput
                  v-model="claimForm.agentName"
                  placeholder="请输入代理人姓名"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人电话">
                <ElInput
                  v-model="claimForm.agentPhone"
                  placeholder="请输入代理人电话"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="代理人身份证号码">
                <ElInput
                  v-model="claimForm.agentIdCard"
                  placeholder="请输入代理人身份证号码"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="代理人联系地址">
                <ElInput
                  v-model="claimForm.agentAddress"
                  placeholder="请输入代理人联系地址"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="账户名称">
                <ElInput
                  v-model="claimForm.accountName"
                  placeholder="请输入账户名称"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="银行账号">
                <ElInput
                  v-model="claimForm.bankAccount"
                  placeholder="请输入银行账号"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="开户银行">
                <ElInput
                  v-model="claimForm.bankName"
                  placeholder="请输入开户银行"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权金额信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报本金">
                <ElInput
                  v-model="claimForm.principal"
                  placeholder="请输入申报本金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报利息">
                <ElInput
                  v-model="claimForm.interest"
                  placeholder="请输入申报利息"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报违约金">
                <ElInput
                  v-model="claimForm.penalty"
                  placeholder="请输入申报违约金"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申报其他损失">
                <ElInput
                  v-model="claimForm.otherLosses"
                  placeholder="请输入申报其他损失"
                  type="number"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="申报总金额">
                <ElInput
                  v-model="totalAmount"
                  placeholder="自动计算"
                  disabled
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div class="section-divider mb-4">
            <h4 class="section-title">债权其他信息</h4>
          </div>

          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElFormItem label="是否有法院判决或仲裁裁决">
                <ElCheckbox v-model="claimForm.hasCourtJudgment">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否已申请执行">
                <ElCheckbox v-model="claimForm.hasExecution">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="是否有抵押物或质押物">
                <ElCheckbox v-model="claimForm.hasCollateral">是</ElCheckbox>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权性质">
                <ElSelect
                  v-model="claimForm.claimNature"
                  placeholder="请选择债权性质"
                  style="width: 100%"
                >
                  <ElOption label="普通债权" value="普通债权" />
                  <ElOption label="优先债权" value="优先债权" />
                  <ElOption label="有财产担保债权" value="有财产担保债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权种类">
                <ElSelect
                  v-model="claimForm.claimType"
                  placeholder="请选择债权种类"
                  style="width: 100%"
                >
                  <ElOption label="借款债权" value="借款债权" />
                  <ElOption label="货款债权" value="货款债权" />
                  <ElOption label="工程款债权" value="工程款债权" />
                  <ElOption label="其他债权" value="其他债权" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权事实与理由描述">
            <ElInput
              v-model="claimForm.claimFacts"
              type="textarea"
              :rows="3"
              placeholder="请输入债权事实与理由描述"
            />
          </ElFormItem>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权人类别">
                <ElInput
                  v-model="claimForm.creditorCategory"
                  placeholder="请输入债权人类别"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="债权性质(管理人自填)">
                <ElInput
                  v-model="claimForm.claimNatureManager"
                  placeholder="请输入债权性质"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="债权标识">
                <ElSelect
                  v-model="claimForm.claimIdentifier"
                  placeholder="请选择债权标识"
                  style="width: 100%"
                >
                  <ElOption label="已确认" value="已确认" />
                  <ElOption label="待确认" value="待确认" />
                  <ElOption label="有异议" value="有异议" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="登记状态">
                <ElSelect
                  v-model="claimForm.registrationStatus"
                  placeholder="请选择登记状态"
                  style="width: 100%"
                >
                  <ElOption label="待审核" value="PENDING" />
                  <ElOption label="已通过" value="APPROVED" />
                  <ElOption label="已驳回" value="REJECTED" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="债权申报证据清单">
            <ElInput
              v-model="claimForm.evidenceList"
              type="textarea"
              :rows="2"
              placeholder="请输入债权申报证据清单"
            />
          </ElFormItem>

          <ElFormItem label="证据材料">
            <ElInput
              v-model="claimForm.evidenceMaterials"
              type="textarea"
              :rows="2"
              placeholder="请输入证据材料"
            />
          </ElFormItem>

          <ElFormItem label="证据材料附件">
            <ElUpload
              v-model:file-list="claimForm.evidenceAttachments"
              :auto-upload="false"
              :limit="5"
              multiple
            >
              <ElButton type="primary" size="small">
                <Icon icon="lucide:upload" class="mr-1" />
                点击上传
              </ElButton>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传文档、图片等文件，单个文件不超过50MB
                </div>
              </template>
            </ElUpload>
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="claimForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeAddDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleAddClaim"
            :loading="addLoading"
          >
            确定
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showImportDialog"
      title="批量导入债权登记"
      width="600px"
      destroy-on-close
    >
      <div class="import-dialog-container">
        <div class="import-description mb-4">
          <p class="mb-2 text-sm text-gray-600">
            请上传Excel文件，支持批量导入债权登记信息。
          </p>
          <ElButton type="primary" link size="small">
            <Icon icon="lucide:download" class="mr-1" />
            下载导入模板
          </ElButton>
        </div>

        <ElUpload
          v-model:file-list="fileList"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls"
          drag
        >
          <Icon icon="lucide:upload-cloud" class="upload-icon" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传 .xlsx 或 .xls 文件</div>
          </template>
        </ElUpload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeImportDialog">取消</ElButton>
          <ElButton
            type="primary"
            @click="handleImport"
            :loading="importLoading"
          >
            导入
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.claim-registration-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.claim-list-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
}

.add-dialog-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 10px 0;
}

.section-divider {
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.import-dialog-container {
  padding: 10px 0;
}

.import-description {
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
}
</style>
