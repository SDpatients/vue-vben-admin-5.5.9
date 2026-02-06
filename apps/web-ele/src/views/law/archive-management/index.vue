<script lang="ts" setup>
import type { UploadFile } from 'element-plus/es/components/upload';

import type { ArchiveApi } from '#/api';
import type { ArchiveListQueryParams } from '#/api/core/archive';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTree,
  ElUpload,
} from 'element-plus';

import {
  AccessLevelMap,
  batchDeleteArchiveRecordsApi,
  deleteArchiveRecordApi,
  downloadArchiveFileApi,
  formatFileSize,
  getArchiveFilesApi,
  getArchiveStatisticsApi,
  getCategoryTreeApi,
  previewArchiveFileApi,
  uploadArchiveFileApi,
  validateFileFormat,
  validateFileSize,
} from '#/api/core/archive';

import { renameFileApi } from '#/api/core/file';

const route = useRoute();
const router = useRouter();

const caseId = computed(() => Number.parseInt(route.params.id as string, 10));

const loading = ref(false);
const uploadLoading = ref(false);
const categoryTree = ref<ArchiveApi.Category[]>([]);
const archiveList = ref<ArchiveApi.ArchiveRecord[]>([]);
const selectedCategoryCode = ref<string>('');
const selectedRowKeys = ref<number[]>([]);
const uploadDialogVisible = ref(false);
const editDialogVisible = ref(false);
const previewDialogVisible = ref(false);
const renameDialogVisible = ref(false);
const currentRecord = ref<ArchiveApi.ArchiveRecord | undefined>(undefined);
const currentRenameRecord = ref<ArchiveApi.ArchiveRecord | undefined>(undefined);
const newFileName = ref('');
const renameLoading = ref(false);
const previewUrl = ref('');

const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const keyword = ref('');

const uploadForm = ref({
  file: null as File | null,
  categoryCode: '',
  fileTitle: '',
  fileDescription: '',
  isConfidential: false,
  accessLevel: 'INTERNAL' as ArchiveApi.AccessLevel,
});

const editForm = ref({
  fileTitle: '',
  fileDescription: '',
  isConfidential: false,
  accessLevel: 'INTERNAL' as ArchiveApi.AccessLevel,
});

const uploadFormRef = ref();
const editFormRef = ref();

const uploadRules = {
  categoryCode: [
    { required: true, message: '请选择归档分类', trigger: 'change' },
  ],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }],
};

const safeArchiveList = computed(() =>
  Array.isArray(archiveList.value) ? archiveList.value : [],
);

const totalFiles = ref(0);

async function loadCategoryTree() {
  try {
    const response = await getCategoryTreeApi();
    if (response.code === 200) {
      categoryTree.value = response.data;
    }
  } catch {
    ElMessage.error('加载归档分类失败');
  }
}

async function loadArchiveList() {
  loading.value = true;
  try {
    const params: ArchiveListQueryParams = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      status: 'ACTIVE',
    };
    if (selectedCategoryCode.value) {
      params.categoryCode = selectedCategoryCode.value;
    }
    if (keyword.value) {
      params.keyword = keyword.value;
    }
    const response = await getArchiveFilesApi(caseId.value, params);
    if (response.code === 200) {
      archiveList.value = response.data.list;
      pagination.value.total = response.data.total;
    }
  } catch {
    ElMessage.error('加载归档文件列表失败');
  } finally {
    loading.value = false;
  }
}

async function loadStatistics() {
  try {
    const params: { categoryCode?: string; status: string } = {
      status: 'ACTIVE',
    };
    if (selectedCategoryCode.value) {
      params.categoryCode = selectedCategoryCode.value;
    }
    const response = await getArchiveStatisticsApi(
      caseId.value,
      params.categoryCode,
      params.status,
    );
    if (response.code === 200) {
      totalFiles.value = response.data;
    }
  } catch (error) {
    console.error('加载统计信息失败', error);
  }
}

function handlePageChange(page: number) {
  pagination.value.pageNum = page;
  loadArchiveList();
}

function handlePageSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.pageNum = 1;
  loadArchiveList();
}

function handleSearch() {
  pagination.value.pageNum = 1;
  loadArchiveList();
}

function handleReset() {
  keyword.value = '';
  selectedCategoryCode.value = '';
  pagination.value.pageNum = 1;
  loadArchiveList();
}

function handleUpload() {
  uploadForm.value = {
    file: null,
    categoryCode: selectedCategoryCode.value,
    fileTitle: '',
    fileDescription: '',
    isConfidential: false,
    accessLevel: 'INTERNAL',
  };
  uploadDialogVisible.value = true;
}

async function handleFileSelect(file: UploadFile) {
  const rawFile = file.raw as File;
  if (!rawFile) return;

  if (!validateFileFormat(rawFile.name)) {
    ElMessage.error('不支持的文件格式');
    return false;
  }

  if (!validateFileSize(rawFile.size)) {
    ElMessage.error('文件大小不能超过50MB');
    return false;
  }

  uploadForm.value.file = rawFile;
  return false;
}

async function handleUploadSubmit() {
  if (!uploadFormRef.value) return;

  try {
    await uploadFormRef.value.validate();
  } catch {
    return;
  }

  if (!uploadForm.value.file) {
    ElMessage.error('请选择文件');
    return;
  }

  uploadLoading.value = true;
  try {
    const response = await uploadArchiveFileApi(caseId.value, uploadForm.value);
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      uploadDialogVisible.value = false;
      loadArchiveList();
      loadStatistics();
    }
  } catch {
    ElMessage.error('文件上传失败');
  } finally {
    uploadLoading.value = false;
  }
}

function handleEdit(record: ArchiveApi.ArchiveRecord) {
  currentRecord.value = record;
  editForm.value = {
    fileTitle: record.fileTitle,
    fileDescription: record.fileDescription,
    isConfidential: record.isConfidential,
    accessLevel: record.accessLevel as ArchiveApi.AccessLevel,
  };
  editDialogVisible.value = true;
}

async function handleEditSubmit() {
  if (!editFormRef.value || !currentRecord.value) return;

  try {
    await editFormRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const response = await updateArchiveRecordApi(
      currentRecord.value.id,
      editForm.value,
    );
    if (response.code === 200) {
      ElMessage.success('更新成功');
      editDialogVisible.value = false;
      loadArchiveList();
    }
  } catch {
    ElMessage.error('更新失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(record: ArchiveApi.ArchiveRecord) {
  try {
    const response = await deleteArchiveRecordApi(record.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadArchiveList();
      loadStatistics();
    }
  } catch {
    ElMessage.error('删除失败');
  }
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要删除的文件');
    return;
  }

  try {
    const response = await batchDeleteArchiveRecordsApi(selectedRowKeys.value);
    if (response.code === 200) {
      ElMessage.success('批量删除成功');
      selectedRowKeys.value = [];
      loadArchiveList();
      loadStatistics();
    }
  } catch {
    ElMessage.error('批量删除失败');
  }
}

async function handleDownload(record: ArchiveApi.ArchiveRecord) {
  try {
    const blob = await downloadArchiveFileApi(record.fileId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.file.originalFileName;
    document.body.append(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch {
    ElMessage.error('下载失败');
  }
}

async function handlePreview(record: ArchiveApi.ArchiveRecord) {
  try {
    const blob = await previewArchiveFileApi(record.fileId);
    const url = window.URL.createObjectURL(blob);
    previewUrl.value = url;
    currentRecord.value = record;
    previewDialogVisible.value = true;
  } catch {
    ElMessage.error('预览失败');
  }
}

function handleNodeClick(data: ArchiveApi.Category) {
  selectedCategoryCode.value = data.categoryCode;
  pagination.value.pageNum = 1;
  loadArchiveList();
  loadStatistics();
}

function handleSelectionChange(selection: ArchiveApi.ArchiveRecord[]) {
  selectedRowKeys.value = selection.map((item) => item.id);
}

// 打开重命名对话框
function handleRename(record: ArchiveApi.ArchiveRecord) {
  currentRenameRecord.value = record;
  newFileName.value = record.file.originalFileName;
  renameDialogVisible.value = true;
}

// 执行重命名操作
async function confirmRename() {
  if (!currentRenameRecord.value || !newFileName.value.trim()) {
    ElMessage.warning('请输入新文件名');
    return;
  }

  try {
    renameLoading.value = true;
    const response = await renameFileApi(currentRenameRecord.value.fileId, newFileName.value.trim());
    if (response.code === 200 && response.data) {
      ElMessage.success('文件重命名成功');
      // 刷新文件列表
      loadArchiveList();
      renameDialogVisible.value = false;
      currentRenameRecord.value = undefined;
      newFileName.value = '';
    } else {
      ElMessage.error(response.message || '文件重命名失败');
    }
  } catch (error) {
    console.error('文件重命名失败:', error);
    ElMessage.error('文件重命名失败');
  } finally {
    renameLoading.value = false;
  }
}

// 取消重命名
function cancelRename() {
  renameDialogVisible.value = false;
  currentRenameRecord.value = undefined;
  newFileName.value = '';
}

onMounted(() => {
  loadCategoryTree();
  loadArchiveList();
  loadStatistics();
});
</script>

<template>
  <div class="archive-management">
    <ElCard class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <ElInput
            v-model="keyword"
            placeholder="搜索文件标题或描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          />
          <ElButton type="primary" @click="handleSearch"> 搜索 </ElButton>
          <ElButton @click="handleReset"> 重置 </ElButton>
        </div>
        <div class="flex items-center gap-4">
          <ElButton type="primary" @click="handleUpload"> 上传文件 </ElButton>
          <ElPopconfirm
            title="确定要删除选中的文件吗？"
            @confirm="handleBatchDelete"
          >
            <template #reference>
              <ElButton type="danger" :disabled="selectedRowKeys.length === 0">
                批量删除
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>
      </div>
    </ElCard>

    <div class="flex gap-4">
      <ElCard class="w-80 flex-shrink-0">
        <template #header>
          <div class="font-semibold">归档分类</div>
        </template>
        <ElTree
          :data="categoryTree"
          :props="{ label: 'categoryName', children: 'children' }"
          node-key="categoryCode"
          @node-click="handleNodeClick"
        />
      </ElCard>

      <ElCard class="flex-1">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">归档文件列表</div>
            <div class="text-sm text-gray-500">共 {{ totalFiles }} 个文件</div>
          </div>
        </template>

        <ElTable
          v-loading="loading"
          :data="safeArchiveList"
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn prop="archiveNo" label="归档编号" width="180" />
          <ElTableColumn prop="fileTitle" label="文件标题" min-width="200" />
          <ElTableColumn prop="categoryName" label="归档分类" width="200" />
          <ElTableColumn label="文件大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.file.fileSize) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="访问级别" width="100">
            <template #default="{ row }">
              <ElTag
                :type="
                  row.accessLevel === 'PUBLIC'
                    ? 'success'
                    : row.accessLevel === 'CONFIDENTIAL'
                      ? 'warning'
                      : 'info'
                "
              >
                {{
                  AccessLevelMap[row.accessLevel as keyof typeof AccessLevelMap]
                }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="是否机密" width="100">
            <template #default="{ row }">
              <ElTag :type="row.isConfidential ? 'danger' : 'info'">
                {{ row.isConfidential ? '是' : '否' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="uploadUserName" label="上传人" width="120" />
          <ElTableColumn prop="uploadTime" label="上传时间" width="180" />
          <ElTableColumn label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <ElButton
                type="primary"
                link
                size="small"
                @click="handlePreview(row)"
              >
                预览
              </ElButton>
              <ElButton
                type="primary"
                link
                size="small"
                @click="handleDownload(row)"
              >
                下载
              </ElButton>
              <ElButton
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </ElButton>
              <ElButton
                type="primary"
                link
                size="small"
                @click="handleRename(row)"
              >
                重命名
              </ElButton>
              <ElPopconfirm
                title="确定要删除这个文件吗？"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <ElButton type="danger" link size="small"> 删除 </ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handlePageSizeChange"
          />
        </div>
      </ElCard>
    </div>

    <ElDialog
      v-model="uploadDialogVisible"
      title="上传归档文件"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-width="120px"
      >
        <ElFormItem label="归档分类" prop="categoryCode">
          <ElSelect
            v-model="uploadForm.categoryCode"
            placeholder="请选择归档分类"
            style="width: 100%"
          >
            <ElOption
              v-for="category in categoryTree"
              :key="category.categoryCode"
              :label="category.categoryName"
              :value="category.categoryCode"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="选择文件" prop="file">
          <ElUpload
            :auto-upload="false"
            :on-change="handleFileSelect"
            :show-file-list="false"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
          >
            <ElButton type="primary"> 选择文件 </ElButton>
            <template #tip>
              <div class="text-xs text-gray-500">
                支持格式: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png,
                gif, bmp, txt
              </div>
            </template>
          </ElUpload>
          <div v-if="uploadForm.file" class="mt-2 text-sm text-gray-600">
            已选择: {{ uploadForm.file.name }} ({{
              formatFileSize(uploadForm.file.size)
            }})
          </div>
        </ElFormItem>
        <ElFormItem label="文件标题" prop="fileTitle">
          <ElInput
            v-model="uploadForm.fileTitle"
            placeholder="请输入文件标题"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="文件描述" prop="fileDescription">
          <ElInput
            v-model="uploadForm.fileDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入文件描述"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="访问级别">
          <ElSelect
            v-model="uploadForm.accessLevel"
            placeholder="请选择访问级别"
            style="width: 100%"
          >
            <ElOption
              v-for="(label, value) in AccessLevelMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="是否机密">
          <ElCheckbox v-model="uploadForm.isConfidential">
            标记为机密文件
          </ElCheckbox>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="uploadDialogVisible = false"> 取消 </ElButton>
        <ElButton
          type="primary"
          :loading="uploadLoading"
          @click="handleUploadSubmit"
        >
          上传
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="editDialogVisible"
      title="编辑归档记录"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm ref="editFormRef" :model="editForm" label-width="120px">
        <ElFormItem label="文件标题">
          <ElInput
            v-model="editForm.fileTitle"
            placeholder="请输入文件标题"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="文件描述">
          <ElInput
            v-model="editForm.fileDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入文件描述"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="访问级别">
          <ElSelect
            v-model="editForm.accessLevel"
            placeholder="请选择访问级别"
            style="width: 100%"
          >
            <ElOption
              v-for="(label, value) in AccessLevelMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="是否机密">
          <ElCheckbox v-model="editForm.isConfidential">
            标记为机密文件
          </ElCheckbox>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false"> 取消 </ElButton>
        <ElButton type="primary" :loading="loading" @click="handleEditSubmit">
          保存
        </ElButton>
    </template>
    </ElDialog>

    <!-- 重命名对话框 -->
    <ElDialog
      v-model="renameDialogVisible"
      title="重命名文件"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="rename-dialog-content">
        <div class="form-item mb-4">
          <label class="form-label block mb-2">当前文件名：</label>
          <div class="current-file-name text-gray-600">{{ currentRenameRecord?.file.originalFileName }}</div>
        </div>
        <div class="form-item">
          <label class="form-label block mb-2">新文件名：</label>
          <ElInput
            v-model="newFileName"
            placeholder="请输入新文件名（包含扩展名）"
            :disabled="renameLoading"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="cancelRename" :loading="renameLoading">
            取消
          </ElButton>
          <ElButton type="primary" @click="confirmRename" :loading="renameLoading">
            确认重命名
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="80%"
      height="80vh"
      :close-on-click-modal="false"
    >
      <div class="h-[600px] w-full">
        <iframe
          v-if="previewUrl"
          :src="previewUrl"
          class="h-full w-full border-0"
        ></iframe>
        <ElEmpty v-else description="无法预览此文件" />
      </div>
      <template #footer>
        <ElButton @click="previewDialogVisible = false"> 关闭 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.archive-management {
  padding: 20px;
}
</style>
