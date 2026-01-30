<script setup lang="ts">
import type { UploadUserFile } from 'element-plus';

import type { ArchiveApi } from '#/api';
import type { ArchiveListQueryParams } from '#/api/core/archive';

import { computed, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElDialog,
  ElDrawer,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTree,
  ElUpload,
} from 'element-plus';

import {
  AccessLevelMap,
  deleteArchiveRecordApi,
  downloadArchiveFileApi,
  formatFileSize,
  getArchiveFilesApi,
  getCategoryTreeApi,
  previewArchiveFileApi,
  updateArchiveRecordApi,
  uploadArchiveFileApi,
  validateFileFormat,
  validateFileSize,
} from '#/api/core/archive';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  categoryCode?: string;
}

const props = defineProps<{
  caseId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const drawerVisible = ref(false);
const selectedNode = ref<null | TreeNode>(null);
const fileList = ref<ArchiveApi.ArchiveRecord[]>([]);
const fileListLoading = ref(false);
const uploadDialogVisible = ref(false);
const editDialogVisible = ref(false);
const uploadFileList = ref<UploadUserFile[]>([]);
const uploadLoading = ref(false);
const currentRecord = ref<ArchiveApi.ArchiveRecord | undefined>(undefined);

const categoryTree = ref<ArchiveApi.Category[]>([]);

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

const archiveTreeData = computed<TreeNode[]>(() => {
  const convertToTreeNode = (category: ArchiveApi.Category): TreeNode => ({
    id: category.categoryCode,
    label: category.categoryName,
    categoryCode: category.categoryCode,
    children: category.children?.map(convertToTreeNode),
  });
  return categoryTree.value.map(convertToTreeNode);
});

const openDrawer = async () => {
  drawerVisible.value = true;
  await loadCategoryTree();
};

const closeDrawer = () => {
  drawerVisible.value = false;
  selectedNode.value = null;
  fileList.value = [];
  emit('close');
};

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

const handleNodeClick = async (data: TreeNode) => {
  if (!data.categoryCode) {
    ElMessage.info('请选择具体的文件分类');
    return;
  }

  selectedNode.value = data;
  await loadFileList(data.categoryCode);
};

const loadFileList = async (categoryCode: string) => {
  fileListLoading.value = true;
  try {
    const params: ArchiveListQueryParams = {
      categoryCode,
      pageNum: 1,
      pageSize: 100,
      status: 'ACTIVE',
    };
    const response = await getArchiveFilesApi(Number(props.caseId), params);
    if (response.code === 200) {
      fileList.value = response.data.list || [];
    } else {
      ElMessage.error('获取文件列表失败');
      fileList.value = [];
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败');
    fileList.value = [];
  } finally {
    fileListLoading.value = false;
  }
};

const openUploadDialog = () => {
  if (!selectedNode.value?.categoryCode) {
    ElMessage.warning('请先选择一个文件分类');
    return;
  }
  uploadForm.value = {
    file: null,
    categoryCode: selectedNode.value.categoryCode,
    fileTitle: '',
    fileDescription: '',
    isConfidential: false,
    accessLevel: 'INTERNAL',
  };
  uploadDialogVisible.value = true;
};

const uploadFiles = async () => {
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
    const response = await uploadArchiveFileApi(
      Number(props.caseId),
      uploadForm.value,
    );
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      uploadDialogVisible.value = false;
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    ElMessage.error('上传文件失败');
  } finally {
    uploadLoading.value = false;
  }
};

const handleFileSelect = (file: any) => {
  const rawFile = file.raw as File;
  if (!rawFile) return false;

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
};

const downloadFile = async (file: ArchiveApi.ArchiveRecord) => {
  try {
    const blob = await downloadArchiveFileApi(file.id);
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = file.file.originalFileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载开始');
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};

const previewFile = async (file: ArchiveApi.ArchiveRecord) => {
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  if (previewableExtensions.includes(file.file.fileExtension.toLowerCase())) {
    try {
      const blob = await previewArchiveFileApi(file.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('预览文件失败:', error);
      ElMessage.error('预览文件失败');
    }
  } else {
    ElMessage.info('该文件类型不支持在线预览，建议下载后查看');
  }
};

const deleteFile = async (file: ArchiveApi.ArchiveRecord) => {
  try {
    const response = await deleteArchiveRecordApi(file.id);
    if (response.code === 200) {
      ElMessage.success('文件删除成功');
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    } else {
      ElMessage.error(`文件删除失败：${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('删除文件失败:', error);
    ElMessage.error('删除文件失败');
  }
};

const handleEdit = (record: ArchiveApi.ArchiveRecord) => {
  currentRecord.value = record;
  editForm.value = {
    fileTitle: record.fileTitle,
    fileDescription: record.fileDescription,
    isConfidential: record.isConfidential,
    accessLevel: record.accessLevel as ArchiveApi.AccessLevel,
  };
  editDialogVisible.value = true;
};

const handleEditSubmit = async () => {
  if (!editFormRef.value || !currentRecord.value) return;

  try {
    await editFormRef.value.validate();
  } catch {
    return;
  }

  try {
    const response = await updateArchiveRecordApi(
      currentRecord.value.id,
      editForm.value,
    );
    if (response.code === 200) {
      ElMessage.success('更新成功');
      editDialogVisible.value = false;
      if (selectedNode.value?.categoryCode) {
        await loadFileList(selectedNode.value.categoryCode);
      }
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败');
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileIcon = (extension: string) => {
  const iconMap: Record<string, string> = {
    pdf: 'lucide:file-text',
    doc: 'lucide:file',
    docx: 'lucide:file',
    xls: 'lucide:file-spreadsheet',
    xlsx: 'lucide:file-spreadsheet',
    jpg: 'lucide:image',
    jpeg: 'lucide:image',
    png: 'lucide:image',
    gif: 'lucide:image',
  };
  return iconMap[extension.toLowerCase()] || 'lucide:file';
};

defineExpose({
  openDrawer,
});
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    title="案件卷宗归档"
    direction="rtl"
    size="80%"
    @close="closeDrawer"
  >
    <div class="archive-container">
      <div class="archive-sidebar">
        <ElCard shadow="never" class="tree-card">
          <template #header>
            <div class="tree-header">
              <Icon icon="lucide:folder-tree" class="mr-2" />
              <span>归档目录</span>
            </div>
          </template>
          <ElTree
            :data="archiveTreeData"
            :props="{ label: 'label', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            class="archive-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <Icon
                  :icon="data.children ? 'lucide:folder' : 'lucide:file'"
                  class="node-icon"
                />
                <span class="node-label">{{ node.label }}</span>
              </div>
            </template>
          </ElTree>
        </ElCard>
      </div>

      <div class="archive-content">
        <ElCard shadow="never" class="content-card">
          <template #header>
            <div class="content-header">
              <div class="header-left">
                <Icon icon="lucide:folder-open" class="mr-2" />
                <span class="current-path">
                  {{ selectedNode?.label || '请选择归档目录' }}
                </span>
              </div>
              <div class="header-right">
                <ElButton
                  type="primary"
                  :disabled="!selectedNode?.categoryCode"
                  @click="openUploadDialog"
                >
                  <Icon icon="lucide:upload" class="mr-1" />
                  上传文件
                </ElButton>
              </div>
            </div>
          </template>

          <div v-if="!selectedNode?.categoryCode" class="empty-state">
            <div>
              <ElEmpty description="请从左侧选择一个归档目录" />
            </div>
          </div>

          <div v-else-if="fileListLoading" class="loading-state">
            <div>
              <ElEmpty description="加载中..." />
            </div>
          </div>

          <div v-else-if="fileList.length === 0" class="empty-state">
            <div>
              <ElEmpty description="暂无文件" />
            </div>
          </div>

          <div v-else class="file-list">
            <ElTable :data="fileList" border stripe style="width: 100%">
              <ElTableColumn type="index" label="序号" width="60" />
              <ElTableColumn label="归档编号" prop="archiveNo" width="180" />
              <ElTableColumn
                label="文件标题"
                prop="fileTitle"
                min-width="200"
              />
              <ElTableColumn label="归档分类" prop="categoryName" width="200" />
              <ElTableColumn
                prop="file.fileSize"
                label="文件大小"
                width="120"
                :formatter="(row) => formatFileSize(row.file.fileSize)"
              />
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
                      AccessLevelMap[
                        row.accessLevel as keyof typeof AccessLevelMap
                      ]
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
              <ElTableColumn
                prop="uploadTime"
                label="上传时间"
                width="180"
                :formatter="(row) => formatDate(row.uploadTime)"
              />
              <ElTableColumn label="操作" width="320">
                <template #default="{ row }">
                  <ElButton
                    size="small"
                    @click="downloadFile(row)"
                    style="margin-right: 8px"
                  >
                    <Icon icon="lucide:download" class="mr-1" />
                    下载
                  </ElButton>
                  <ElButton
                    size="small"
                    @click="previewFile(row)"
                    style="margin-right: 8px"
                  >
                    <Icon icon="lucide:eye" class="mr-1" />
                    预览
                  </ElButton>
                  <ElButton
                    size="small"
                    @click="handleEdit(row)"
                    style="margin-right: 8px"
                  >
                    <Icon icon="lucide:edit" class="mr-1" />
                    编辑
                  </ElButton>
                  <ElPopconfirm
                    title="确定要删除这个文件吗？"
                    @confirm="deleteFile(row)"
                  >
                    <ElButton size="small" type="danger">
                      <Icon icon="lucide:trash-2" class="mr-1" />
                      删除
                    </ElButton>
                  </ElPopconfirm>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElCard>
      </div>
    </div>

    <ElDialog
      v-model="uploadDialogVisible"
      title="上传归档文件"
      width="600px"
      destroy-on-close
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
            disabled
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
            <div>
              <ElButton type="primary"> 选择文件 </ElButton>
            </div>
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
        <ElButton @click="uploadDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploadLoading" @click="uploadFiles">
          上传
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="editDialogVisible"
      title="编辑归档记录"
      width="600px"
      destroy-on-close
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
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEditSubmit"> 保存 </ElButton>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<style scoped>
.archive-container {
  display: flex;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.archive-sidebar {
  flex-shrink: 0;
  width: 350px;
}

.tree-card {
  height: 100%;
}

.tree-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.tree-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.archive-tree {
  background: transparent;
}

.tree-node {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
}

.node-icon {
  font-size: 16px;
  color: #6b7280;
}

.node-label {
  font-size: 14px;
  color: #374151;
}

.archive-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.content-card {
  height: 100%;
}

.content-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.current-path {
  font-size: 16px;
}

.empty-state,
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.file-list {
  height: 100%;
  overflow-x: auto;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
