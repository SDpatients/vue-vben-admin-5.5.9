<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import { Loading } from '@element-plus/icons-vue';
import { ElButton, ElCard, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElOption, ElSelect, ElTable, ElTableColumn, ElDatePicker, ElImageViewer, ElSkeleton } from 'element-plus';

import { Icon } from '@iconify/vue';

import FileUpload from '#/views/law/case-detail/components/FileUpload.vue';
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
  linkReimbursementAttachment,
} from '#/api/core/expense-reimbursement';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const isEdit = computed(() => !!route.params.id);

const hasAccessPermission = ref(true);
const permissionChecking = ref(true);
const permissionDeniedMessage = ref('');

const currentUserId = computed(() => {
  const userId = userStore.userInfo?.userId;
  if (userId) {
    return Number.parseInt(userId as string, 10);
  }
  const localStorageUserId = localStorage.getItem('user_id');
  if (localStorageUserId) {
    return Number.parseInt(localStorageUserId, 10);
  }
  return 0;
});

const isAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('ADMIN') || roles.includes('admin') || roles.includes('管理员');
});

const isSuperAdmin = computed(() => {
  const roles = userStore.userRoles || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('超级管理员');
});

const formRef = ref();
const fileUploadRef = ref<any>();
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
  permissionChecking.value = true;
  try {
    const response = await getReimbursementDetail(id);
    
    if (response.code === 403) {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = response.message || '您没有权限编辑此报销单';
      ElMessage.error(permissionDeniedMessage.value);
      return;
    }
    
    if (response.code === 404) {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = '报销单不存在或已被删除';
      ElMessage.error(permissionDeniedMessage.value);
      return;
    }
    
    const data = response.data;
    
    const isCreator = data.creatorId && currentUserId.value === data.creatorId;
    const canEditThis = isAdmin.value || isSuperAdmin.value || isCreator;
    
    if (!canEditThis && data.approvalStatus !== 'PENDING') {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = '您没有权限编辑此报销单';
      ElMessage.error(permissionDeniedMessage.value);
      return;
    }
    
    hasAccessPermission.value = true;

    reimbursementForm.id = data.id;
    reimbursementForm.caseId = data.caseId;
    reimbursementForm.fundAccountId = data.fundAccountId;
    reimbursementForm.reimbursementDate = data.reimbursementDate;
    reimbursementForm.description = data.description || '';

    items.value = data.items || [];
    attachments.value = data.attachments || [];
  } catch (error: any) {
    console.error('获取报销单详情失败:', error);
    
    if (error?.response?.status === 403) {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = '您没有权限编辑此报销单';
    } else if (error?.response?.status === 404) {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = '报销单不存在或已被删除';
    } else {
      hasAccessPermission.value = false;
      permissionDeniedMessage.value = '获取报销单详情失败，请稍后重试';
    }
    ElMessage.error(permissionDeniedMessage.value);
  } finally {
    loading.value = false;
    permissionChecking.value = false;
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
          
          // 转移手机上传的临时文件（如果有）
          if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
            console.log('发现手机上传的临时文件，开始转移...');
            const transferredFiles = await fileUploadRef.value.transferMobileFiles(reimbursementForm.id);
            console.log('转移成功的文件:', transferredFiles);
          }
          
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

          const reimbursementId = response.data.reimbursementId;
          console.log('创建报销单成功，ID:', reimbursementId);
          
          // 1. 转移手机上传的临时文件（如果有）
          let transferredFileIds: number[] = [];
          if (fileUploadRef.value && fileUploadRef.value.getHasUntransferredFiles()) {
            console.log('发现手机上传的临时文件，开始转移...');
            const transferredFiles = await fileUploadRef.value.transferMobileFiles(reimbursementId);
            console.log('转移成功的文件:', transferredFiles);
            
            // 收集转移成功的文件 ID 并关联到报销单
            if (transferredFiles && transferredFiles.length > 0) {
              for (const file of transferredFiles) {
                try {
                  await linkReimbursementAttachment(reimbursementId, file.id);
                  transferredFileIds.push(file.id);
                  console.log('关联文件成功:', file.id, file.originalFileName);
                } catch (error) {
                  console.error('关联文件失败:', file.id, error);
                }
              }
            }
          }

          // 2. 上传本地文件（电脑选择的文件）
          if (attachments.value.length > 0) {
            console.log('=== 准备报销附件上传 ===');
            console.log('attachments:', attachments.value);
            
            // 过滤出需要上传的本地文件（不是手机上传的文件）
            const filesToUpload = attachments.value
              .filter((attach: any) => {
                const isMobile = attach.id?.toString().startsWith('mobile-');
                const hasFile = !!attach.file;
                console.log('检查文件:', attach.originalFileName || attach.fileName, {
                  isMobile,
                  hasFile,
                  id: attach.id
                });
                return !isMobile && hasFile;
              })
              .map((attach: any) => attach.file);

            console.log('需要上传的文件数量:', filesToUpload.length);

            if (filesToUpload.length > 0) {
              for (const file of filesToUpload) {
                try {
                  console.log('上传文件:', file.name);
                  await uploadReimbursementAttachment(reimbursementId, file);
                } catch (error) {
                  console.error('上传附件失败:', error);
                }
              }
              ElMessage.success('附件上传成功');
            }
          }
          
          // 3. 如果有转移的手机文件，提示用户
          if (transferredFileIds.length > 0) {
            console.log('手机上传的文件已关联，文件 ID:', transferredFileIds);
            ElMessage.success(`成功关联 ${transferredFileIds.length} 个手机上传的文件`);
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

onMounted(async () => {
  await fetchCaseOptions();
  await fetchBankAccountOptions();
  if (isEdit.value) {
    await fetchReimbursementDetail(Number(route.params.id));
  } else {
    permissionChecking.value = false;
  }
});
</script>

<template>
  <div class="expense-reimbursement-form-page">
    <!-- 权限检查中或无权限时的显示 -->
    <ElCard v-if="permissionChecking || !hasAccessPermission" shadow="hover" class="permission-check-card">
      <div class="permission-check-container">
        <ElSkeleton v-if="permissionChecking" :rows="5" animated />
        <div v-else class="permission-denied">
          <Icon icon="lucide:shield-x" class="permission-denied-icon" />
          <h2 class="permission-denied-title">访问受限</h2>
          <p class="permission-denied-message">{{ permissionDeniedMessage }}</p>
          <p class="permission-denied-hint">您可能没有权限编辑此报销单，或报销单不存在。</p>
          <div class="permission-denied-actions">
            <ElButton type="primary" @click="handleCancel">
              <Icon icon="lucide:arrow-left" class="mr-2" />
              返回列表
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 有权限时显示正常内容 -->
    <div v-show="hasAccessPermission && !permissionChecking">
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
          </div>
        </template>
        <FileUpload
          ref="fileUploadRef"
          v-model="attachments"
          :model-value="[]"
          :biz-type="'expense_reimbursement'"
          :biz-id="reimbursementForm.id || 0"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
          :max-size="50 * 1024 * 1024"
          :multiple="true"
          title="报销附件"
          :disabled="false"
          :local-mode="!isEdit"
          :existing-files="isEdit ? attachments.filter(a => a.id).map(a => ({
            id: a.id,
            originalFileName: a.fileName,
            fileSize: a.fileSize,
            fileExtension: a.fileType?.split('/')?.pop() || '',
            mimeType: a.fileType,
            filePath: a.filePath,
            uploadTime: a.uploadTime,
          })) : []"
          @local-files-change="(files) => { console.log('报销附件变化:', files); attachments = files; }"
        />
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

/* 权限检查卡片样式 */
.permission-check-card {
  margin: 20px;
  min-height: 400px;
}

.permission-check-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.permission-denied {
  text-align: center;
  padding: 40px;
}

.permission-denied-icon {
  font-size: 80px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.permission-denied-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
}

.permission-denied-message {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

.permission-denied-hint {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.permission-denied-actions {
  margin-top: 20px;
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
