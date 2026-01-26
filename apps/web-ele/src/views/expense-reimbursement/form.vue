<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Loading } from '@element-plus/icons-vue';
import { ElImageViewer, ElMessage, ElMessageBox } from 'element-plus';

import { getBankAccountListApi } from '#/api/core/bank-account';
import { getCaseSimpleListApi } from '#/api/core/case';
import {
  addReimbursementItem,
  createReimbursement,
  deleteReimbursementAttachment,
  deleteReimbursementItem,
  downloadReimbursementAttachment,
  getReimbursementDetail,
  previewReimbursementAttachment,
  updateReimbursement,
  uploadReimbursementAttachment,
} from '#/api/core/expense-reimbursement';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const saving = ref(false);
const isEdit = computed(() => !!route.params.id);

const formRef = ref();
const reimbursementForm = reactive({
  id: 0,
  caseId: undefined as number | undefined,
  fundAccountId: undefined as number | undefined,
  reimbursementDate: '',
  description: '',
});

const items = ref<any[]>([]);
const attachments = ref<any[]>([]);

const caseOptions = ref<any[]>([]);
const bankAccountOptions = ref<any[]>([]);

const totalAmount = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.itemAmount || 0), 0);
});

const addItemDialogVisible = ref(false);
const itemForm = reactive({
  itemName: '',
  itemAmount: 0,
  itemDescription: '',
});

const uploadRef = ref();
const fileLoading = ref(false);
const imageViewerVisible = ref(false);
const currentImageUrl = ref('');

const isImageType = (fileType: string) => {
  return [
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
  ].includes(fileType);
};

const previewFile = async (attachment: any) => {
  fileLoading.value = true;
  try {
    const blob = await previewReimbursementAttachment(attachment.id);
    const url = URL.createObjectURL(blob);

    if (isImageType(attachment.fileType)) {
      currentImageUrl.value = url;
      imageViewerVisible.value = true;
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  } catch (error) {
    ElMessage.error('预览文件失败');
    console.error('预览文件失败:', error);
  } finally {
    fileLoading.value = false;
  }
};

const downloadFile = async (attachment: any) => {
  fileLoading.value = true;
  try {
    const blob = await downloadReimbursementAttachment(attachment.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载文件失败');
    console.error('下载文件失败:', error);
  } finally {
    fileLoading.value = false;
  }
};

const fetchCaseOptions = async () => {
  try {
    const response = await getCaseSimpleListApi({ page: 1, size: 100 });
    caseOptions.value = response.data.list;
  } catch (error) {
    console.error('获取案件列表失败:', error);
  }
};

const fetchBankAccountOptions = async () => {
  try {
    const response = await getBankAccountListApi({ pageNum: 1, pageSize: 100 });
    bankAccountOptions.value = response.data.list;
  } catch (error) {
    console.error('获取银行账户列表失败:', error);
  }
};

const fetchReimbursementDetail = async (id: number) => {
  loading.value = true;
  try {
    const response = await getReimbursementDetail(id);
    const data = response.data;

    reimbursementForm.id = data.id;
    reimbursementForm.caseId = data.caseId;
    reimbursementForm.fundAccountId = data.fundAccountId;
    reimbursementForm.reimbursementDate = data.reimbursementDate;
    reimbursementForm.description = data.description || '';

    items.value = data.items || [];
    attachments.value = data.attachments || [];
  } catch (error) {
    ElMessage.error('获取报销单详情失败');
    console.error('获取报销单详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAddItem = () => {
  itemForm.itemName = '';
  itemForm.itemAmount = 0;
  itemForm.itemDescription = '';
  addItemDialogVisible.value = true;
};

const handleSaveItem = async () => {
  if (!itemForm.itemName) {
    ElMessage.warning('请输入费用名称');
    return;
  }
  if (!itemForm.itemAmount || itemForm.itemAmount <= 0) {
    ElMessage.warning('请输入有效的费用金额');
    return;
  }

  if (isEdit.value) {
    try {
      saving.value = true;
      const response = await addReimbursementItem(reimbursementForm.id, {
        itemName: itemForm.itemName,
        itemAmount: itemForm.itemAmount,
        itemDescription: itemForm.itemDescription,
      });
      items.value.push({
        id: response.data.itemId,
        itemName: itemForm.itemName,
        itemAmount: itemForm.itemAmount,
        itemDescription: itemForm.itemDescription,
      });
      ElMessage.success('添加明细成功');
      addItemDialogVisible.value = false;
    } catch (error) {
      ElMessage.error('添加明细失败');
      console.error('添加明细失败:', error);
    } finally {
      saving.value = false;
    }
  } else {
    items.value.push({
      ...itemForm,
    });
    addItemDialogVisible.value = false;
  }
};

const handleDeleteItem = async (index: number) => {
  if (isEdit.value) {
    try {
      await ElMessageBox.confirm('确定要删除该明细吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      saving.value = true;
      await deleteReimbursementItem(
        reimbursementForm.id,
        items.value[index].id,
      );
      items.value.splice(index, 1);
      ElMessage.success('删除明细成功');
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除明细失败');
        console.error('删除明细失败:', error);
      }
    } finally {
      saving.value = false;
    }
  } else {
    items.value.splice(index, 1);
  }
};

const handleFileChange = async (file: any) => {
  if (isEdit.value) {
    try {
      saving.value = true;
      const response = await uploadReimbursementAttachment(
        reimbursementForm.id,
        file.raw,
      );
      attachments.value.push({
        id: response.data.attachmentId,
        fileName: file.name,
        filePath: response.data.filePath,
        fileSize: file.size,
        fileType: file.raw.type,
        uploadTime: new Date().toISOString(),
      });
      ElMessage.success('上传附件成功');
    } catch (error) {
      ElMessage.error('上传附件失败');
      console.error('上传附件失败:', error);
    } finally {
      saving.value = false;
    }
  } else {
    attachments.value.push({
      file: file.raw,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.raw.type,
    });
  }
};

const handleDeleteAttachment = async (index: number) => {
  if (isEdit.value) {
    try {
      await ElMessageBox.confirm('确定要删除该附件吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      saving.value = true;
      await deleteReimbursementAttachment(
        reimbursementForm.id,
        attachments.value[index].id,
      );
      attachments.value.splice(index, 1);
      ElMessage.success('删除附件成功');
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除附件失败');
        console.error('删除附件失败:', error);
      }
    } finally {
      saving.value = false;
    }
  } else {
    attachments.value.splice(index, 1);
  }
};

const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (items.value.length === 0) {
        ElMessage.warning('请至少添加一条报销明细');
        return;
      }

      saving.value = true;
      try {
        if (isEdit.value) {
          await updateReimbursement(reimbursementForm.id, {
            caseId: reimbursementForm.caseId!,
            fundAccountId: reimbursementForm.fundAccountId!,
            reimbursementDate: reimbursementForm.reimbursementDate,
            description: reimbursementForm.description,
          });
          ElMessage.success('更新成功');
        } else {
          const response = await createReimbursement({
            caseId: reimbursementForm.caseId!,
            fundAccountId: reimbursementForm.fundAccountId!,
            reimbursementDate: reimbursementForm.reimbursementDate,
            description: reimbursementForm.description,
            items: items.value.map((item) => ({
              itemName: item.itemName,
              itemAmount: item.itemAmount,
              itemDescription: item.itemDescription,
            })),
          });

          if (attachments.value.length > 0) {
            for (const attachment of attachments.value) {
              if (attachment.file) {
                await uploadReimbursementAttachment(
                  response.data.reimbursementId,
                  attachment.file,
                );
              }
            }
          }

          ElMessage.success('创建成功');
        }
        router.push('/expense-reimbursement');
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
        console.error('保存报销单失败:', error);
      } finally {
        saving.value = false;
      }
    }
  });
};

const handleCancel = () => {
  router.push('/expense-reimbursement');
};

onMounted(() => {
  fetchCaseOptions();
  fetchBankAccountOptions();
  if (isEdit.value) {
    fetchReimbursementDetail(Number(route.params.id));
  }
});
</script>

<template>
  <div class="expense-reimbursement-form-page">
    <div class="page-header">
      <h1>{{ isEdit ? '编辑报销单' : '新增报销单' }}</h1>
    </div>

    <div class="expense-reimbursement-form-content">
      <el-card shadow="hover" class="form-card">
        <el-form
          ref="formRef"
          :model="reimbursementForm"
          label-width="120px"
          :rules="{
            caseId: [
              { required: true, message: '请选择案件', trigger: 'change' },
            ],
            fundAccountId: [
              { required: true, message: '请选择收款账户', trigger: 'change' },
            ],
            reimbursementDate: [
              { required: true, message: '请选择报销日期', trigger: 'change' },
            ],
          }"
        >
          <el-form-item label="案件" prop="caseId">
            <el-select
              v-model="reimbursementForm.caseId"
              placeholder="请选择案件"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in caseOptions"
                :key="item.id"
                :label="`${item.caseNumber} - ${item.caseName}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="收款账户" prop="fundAccountId">
            <el-select
              v-model="reimbursementForm.fundAccountId"
              placeholder="请选择收款账户"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in bankAccountOptions"
                :key="item.id"
                :label="`${item.accountName} - ${item.bankName} (${item.accountNumber})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="报销日期" prop="reimbursementDate">
            <el-date-picker
              v-model="reimbursementForm.reimbursementDate"
              type="date"
              placeholder="请选择报销日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="报销说明">
            <el-input
              v-model="reimbursementForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入报销说明"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="hover" class="items-card">
        <template #header>
          <div class="card-header">
            <span>报销明细</span>
            <el-button type="primary" size="small" @click="handleAddItem">
              <i class="el-icon-plus"></i> 添加明细
            </el-button>
          </div>
        </template>
        <el-table :data="items" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="itemName" label="费用名称" width="200" />
          <el-table-column
            prop="itemAmount"
            label="费用金额"
            width="150"
            align="right"
          >
            <template #default="scope">
              {{ (scope.row.itemAmount || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="itemDescription" label="费用说明" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteItem(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="total-amount">
          <span>总金额：</span>
          <span class="amount">{{ totalAmount.toFixed(2) }} 元</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="attachments-card">
        <template #header>
          <div class="card-header">
            <span>附件</span>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
            >
              <el-button type="primary" size="small">
                <i class="el-icon-upload"></i> 上传附件
              </el-button>
            </el-upload>
          </div>
        </template>
        <el-table :data="attachments" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="fileName" label="文件名" />
          <el-table-column prop="fileSize" label="文件大小" width="150">
            <template #default="scope">
              {{ (scope.row.fileSize / 1024).toFixed(2) }} KB
            </template>
          </el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180">
            <template #default="scope">
              {{
                scope.row.uploadTime
                  ? new Date(scope.row.uploadTime).toLocaleString('zh-CN')
                  : '-'
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.id"
                type="primary"
                size="small"
                @click="previewFile(scope.row)"
              >
                预览
              </el-button>
              <el-button
                v-if="scope.row.id"
                type="success"
                size="small"
                @click="downloadFile(scope.row)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteAttachment(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="addItemDialogVisible"
      title="添加报销明细"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="itemForm" label-width="100px">
        <el-form-item label="费用名称" required>
          <el-input
            v-model="itemForm.itemName"
            placeholder="请输入费用名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="费用金额" required>
          <el-input-number
            v-model="itemForm.itemAmount"
            :min="0"
            :precision="2"
            placeholder="请输入费用金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="费用说明">
          <el-input
            v-model="itemForm.itemDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入费用说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addItemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveItem">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片查看器 -->
    <ElImageViewer
      v-if="imageViewerVisible"
      :url-list="[currentImageUrl]"
      @close="imageViewerVisible = false"
    />

    <!-- 文件操作遮罩层 -->
    <div v-if="fileLoading" class="file-loading-mask">
      <Loading class="is-loading" />
      <span>文件处理中...</span>
    </div>
  </div>
</template>

<style scoped>
.expense-reimbursement-form-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.expense-reimbursement-form-content {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.form-card {
  margin-bottom: 20px;
}

.items-card,
.attachments-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  font-size: 16px;
}

.total-amount .amount {
  margin-left: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.file-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
  font-size: 16px;
  gap: 10px;
}

.file-loading-mask .is-loading {
  font-size: 32px;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
