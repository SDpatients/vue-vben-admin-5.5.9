<script lang="ts" setup>
import type { UploadFile } from 'element-plus';

import { reactive, ref, onMounted } from 'vue';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRow,
  ElSelect,
  ElTabPane,
  ElTabs,
  ElTag,
  ElUpload,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElPagination,
} from 'element-plus';

import {
  generateDataReportTemplateApi,
  generateCustomTemplateApi,
  fillTemplateApi,
  exportSampleReportApi,
  generateAndFillTemplateApi,
  getSampleDataApi,
  cleanupTemplatesApi,
  getOnlyOfficeConfigApi,
  lockFileApi,
  unlockFileApi,
  getEditHistoryApi,
  getCollaboratorsApi,
  type OnlyOfficeTemplateApi,
} from '#/api/core/onlyoffice-template';

import {
  uploadFileApi,
  getFileListApi,
  downloadFileApi,
  type FileApi,
} from '#/api/core/file';

const activeTab = ref('template');
const editorDialogVisible = ref(false);
const historyDialogVisible = ref(false);
const collaboratorsDialogVisible = ref(false);

const dataReportForm = reactive({
  templateName: 'my_report',
});

const customTemplateForm = reactive({
  templateName: 'custom_template',
  title: '我的自定义报告',
  sectionsText: '第一章：项目概述\n第二章：实施进度\n第三章：成果展示',
});

const fillTemplateForm = reactive({
  templatePath: '',
  dataJson: '{\n  "reportTitle": "2024 年度数据分析报告",\n  "reportNo": "RPT-2024-001",\n  "reportDate": "2024-03-07",\n  "company": "某某科技公司",\n  "creator": "张三"\n}',
});

const generateAndFillForm = reactive({
  templateType: 'data',
  dataJson: '{\n  "reportTitle": "2024 年度数据分析报告",\n  "reportNo": "RPT-2024-001",\n  "reportDate": "2024-03-07",\n  "company": "某某科技公司",\n  "creator": "张三"\n}',
});

const uploadForm = reactive({
  bizType: 'common',
  bizId: 1,
});

const queryForm = reactive({
  bizType: 'common',
  bizId: 1,
  pageNum: 1,
  pageSize: 10,
});

const onlyofficeForm = reactive({
  fileId: 1,
});

const loading = reactive({
  dataReport: false,
  customTemplate: false,
  fillTemplate: false,
  exportSample: false,
  generateAndFill: false,
  getSampleData: false,
  cleanup: false,
  upload: false,
  query: false,
  getConfig: false,
  lock: false,
  unlock: false,
  getHistory: false,
  getCollaborators: false,
});

const sampleData = ref<Record<string, any>>({});
const fileList = ref<FileApi.FileRecord[]>([]);
const total = ref(0);
const editHistory = ref<OnlyOfficeTemplateApi.EditHistoryResponse['data']['history']>([]);
const collaborators = ref<OnlyOfficeTemplateApi.CollaboratorsResponse['data']>([]);
const currentEditorConfig = ref<any>(null);
const uploadFileList = ref<UploadFile[]>([]);

const handleGenerateDataReport = async () => {
  if (!dataReportForm.templateName.trim()) {
    ElMessage.warning('请输入模板名称');
    return;
  }
  loading.dataReport = true;
  try {
    const response = await generateDataReportTemplateApi(dataReportForm.templateName);
    if (response.code === 200) {
      ElMessage.success(`模板生成成功: ${response.data.templatePath}`);
      fillTemplateForm.templatePath = response.data.templatePath;
    }
  } catch (error: any) {
    ElMessage.error(`生成失败: ${error.message || '未知错误'}`);
  } finally {
    loading.dataReport = false;
  }
};

const handleGenerateCustomTemplate = async () => {
  if (!customTemplateForm.templateName.trim() || !customTemplateForm.title.trim()) {
    ElMessage.warning('请输入完整信息');
    return;
  }
  loading.customTemplate = true;
  try {
    const sections = customTemplateForm.sectionsText.split('\n').filter(s => s.trim());
    const response = await generateCustomTemplateApi({
      templateName: customTemplateForm.templateName,
      title: customTemplateForm.title,
      sections,
    });
    if (response.code === 200) {
      ElMessage.success(`自定义模板生成成功: ${response.data.templatePath}`);
      fillTemplateForm.templatePath = response.data.templatePath;
    }
  } catch (error: any) {
    ElMessage.error(`生成失败: ${error.message || '未知错误'}`);
  } finally {
    loading.customTemplate = false;
  }
};

const handleFillTemplate = async () => {
  if (!fillTemplateForm.templatePath.trim()) {
    ElMessage.warning('请先输入模板路径');
    return;
  }
  let data;
  try {
    data = JSON.parse(fillTemplateForm.dataJson);
  } catch (e) {
    ElMessage.error('JSON 格式错误');
    return;
  }
  loading.fillTemplate = true;
  try {
    const blob = await fillTemplateApi(fillTemplateForm.templatePath, data);
    downloadBlob(blob, 'filled_template.docx');
    ElMessage.success('模板填充成功,文件开始下载');
  } catch (error: any) {
    ElMessage.error(`填充失败: ${error.message || '未知错误'}`);
  } finally {
    loading.fillTemplate = false;
  }
};

const handleExportSample = async () => {
  loading.exportSample = true;
  try {
    const blob = await exportSampleReportApi();
    downloadBlob(blob, 'sample_report.docx');
    ElMessage.success('示例报告导出成功');
  } catch (error: any) {
    ElMessage.error(`导出失败: ${error.message || '未知错误'}`);
  } finally {
    loading.exportSample = false;
  }
};

const handleGenerateAndFill = async () => {
  let data;
  try {
    data = JSON.parse(generateAndFillForm.dataJson);
  } catch (e) {
    ElMessage.error('JSON 格式错误');
    return;
  }
  loading.generateAndFill = true;
  try {
    const blob = await generateAndFillTemplateApi(generateAndFillForm.templateType, data);
    downloadBlob(blob, `${generateAndFillForm.templateType}_report.docx`);
    ElMessage.success('生成并填充成功,文件开始下载');
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`);
  } finally {
    loading.generateAndFill = false;
  }
};

const handleGetSampleData = async () => {
  loading.getSampleData = true;
  try {
    const response = await getSampleDataApi();
    if (response.code === 200) {
      sampleData.value = response.data;
      fillTemplateForm.dataJson = JSON.stringify(response.data, null, 2);
      generateAndFillForm.dataJson = JSON.stringify(response.data, null, 2);
      ElMessage.success('获取示例数据成功');
    }
  } catch (error: any) {
    ElMessage.error(`获取失败: ${error.message || '未知错误'}`);
  } finally {
    loading.getSampleData = false;
  }
};

const handleCleanup = async () => {
  loading.cleanup = true;
  try {
    const response = await cleanupTemplatesApi();
    if (response.code === 200) {
      ElMessage.success(response.data || '清理成功');
    }
  } catch (error: any) {
    ElMessage.error(`清理失败: ${error.message || '未知错误'}`);
  } finally {
    loading.cleanup = false;
  }
};

const handleUploadFileChange = (file: UploadFile) => {
  uploadFileList.value = [file];
};

const handleUpload = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }
  const file = uploadFileList.value[0].raw;
  if (!file) {
    ElMessage.warning('文件对象不存在');
    return;
  }
  loading.upload = true;
  try {
    const response = await uploadFileApi(file, uploadForm.bizType, uploadForm.bizId);
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      onlyofficeForm.fileId = response.data.id;
      uploadFileList.value = [];
      await handleQuery();
    }
  } catch (error: any) {
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`);
  } finally {
    loading.upload = false;
  }
};

const handleQuery = async () => {
  loading.query = true;
  try {
    const response = await getFileListApi(
      queryForm.bizType,
      queryForm.bizId,
      queryForm.pageNum,
      queryForm.pageSize,
    );
    if (response.code === 200) {
      fileList.value = response.data.list;
      total.value = response.data.total;
    }
  } catch (error: any) {
    ElMessage.error(`查询失败: ${error.message || '未知错误'}`);
  } finally {
    loading.query = false;
  }
};

const handleDownload = async (file: FileApi.FileRecord) => {
  try {
    const blob = await downloadFileApi(file.id);
    downloadBlob(blob, file.originalFileName);
    ElMessage.success('文件下载开始');
  } catch (error: any) {
    ElMessage.error(`下载失败: ${error.message || '未知错误'}`);
  }
};

const handleGetConfig = async () => {
  loading.getConfig = true;
  try {
    const response = await getOnlyOfficeConfigApi(onlyofficeForm.fileId);
    if (response.code === 200) {
      currentEditorConfig.value = response.data;
      editorDialogVisible.value = true;
    }
  } catch (error: any) {
    ElMessage.error(`获取配置失败: ${error.message || '未知错误'}`);
  } finally {
    loading.getConfig = false;
  }
};

const handleLock = async () => {
  loading.lock = true;
  try {
    await lockFileApi(onlyofficeForm.fileId);
    ElMessage.success('文件已锁定');
  } catch (error: any) {
    ElMessage.error(`锁定失败: ${error.message || '未知错误'}`);
  } finally {
    loading.lock = false;
  }
};

const handleUnlock = async () => {
  loading.unlock = true;
  try {
    await unlockFileApi(onlyofficeForm.fileId);
    ElMessage.success('文件已解锁');
  } catch (error: any) {
    ElMessage.error(`解锁失败: ${error.message || '未知错误'}`);
  } finally {
    loading.unlock = false;
  }
};

const handleGetHistory = async () => {
  loading.getHistory = true;
  try {
    const response = await getEditHistoryApi(onlyofficeForm.fileId);
    if (response.code === 200) {
      editHistory.value = response.data.history;
      historyDialogVisible.value = true;
    }
  } catch (error: any) {
    ElMessage.error(`获取历史失败: ${error.message || '未知错误'}`);
  } finally {
    loading.getHistory = false;
  }
};

const handleGetCollaborators = async () => {
  loading.getCollaborators = true;
  try {
    const response = await getCollaboratorsApi(onlyofficeForm.fileId);
    if (response.code === 200) {
      collaborators.value = response.data;
      collaboratorsDialogVisible.value = true;
    }
  } catch (error: any) {
    ElMessage.error(`获取协作者失败: ${error.message || '未知错误'}`);
  } finally {
    loading.getCollaborators = false;
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="onlyoffice-test-container">
    <ElCard class="header-card">
      <h2>OnlyOffice 模板测试</h2>
      <p class="description">集成 Apache POI Word 模板生成和 OnlyOffice 在线编辑</p>
    </ElCard>

    <ElTabs v-model="activeTab" type="card">
      <ElTabPane label="模板生成" name="template">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>1. 生成数据报告模板</span>
                </div>
              </template>
              <ElForm :model="dataReportForm" label-width="120px">
                <ElFormItem label="模板名称">
                  <ElInput v-model="dataReportForm.templateName" placeholder="请输入模板名称" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleGenerateDataReport" :loading="loading.dataReport">
                    生成模板
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>

          <ElCol :span="12">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>2. 生成自定义模板</span>
                </div>
              </template>
              <ElForm :model="customTemplateForm" label-width="120px">
                <ElFormItem label="模板名称">
                  <ElInput v-model="customTemplateForm.templateName" placeholder="请输入模板名称" />
                </ElFormItem>
                <ElFormItem label="模板标题">
                  <ElInput v-model="customTemplateForm.title" placeholder="请输入模板标题" />
                </ElFormItem>
                <ElFormItem label="章节列表">
                  <ElInput v-model="customTemplateForm.sectionsText" type="textarea" :rows="4" placeholder="每行一个章节" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleGenerateCustomTemplate" :loading="loading.customTemplate">
                    生成自定义模板
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" style="margin-top: 20px">
          <ElCol :span="24">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>3. 填充模板数据</span>
                </div>
              </template>
              <ElForm :model="fillTemplateForm" label-width="120px">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="模板路径">
                      <ElInput v-model="fillTemplateForm.templatePath" placeholder="模板路径将在生成后自动填充" />
                    </ElFormItem>
                    <ElFormItem>
                      <ElButton type="success" @click="handleGetSampleData" :loading="loading.getSampleData">
                        获取示例数据
                      </ElButton>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="模板数据 (JSON)">
                      <ElInput v-model="fillTemplateForm.dataJson" type="textarea" :rows="8" placeholder="请输入 JSON 格式的模板数据" />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem>
                  <ElButton type="primary" @click="handleFillTemplate" :loading="loading.fillTemplate">
                    填充并下载
                  </ElButton>
                  <ElButton type="warning" @click="handleExportSample" :loading="loading.exportSample">
                    导出示例报告
                  </ElButton>
                </ElFormItem>
              </ElForm>
              <ElDivider />
              <div v-if="Object.keys(sampleData).length > 0">
                <h4>示例数据预览:</h4>
                <ElDescriptions :column="2" border>
                  <ElDescriptionsItem v-for="(value, key) in sampleData" :key="key" :label="key">
                    {{ value }}
                  </ElDescriptionsItem>
                </ElDescriptions>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" style="margin-top: 20px">
          <ElCol :span="24">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>4. 一步生成并填充</span>
                </div>
              </template>
              <ElForm :model="generateAndFillForm" label-width="120px">
                <ElFormItem label="模板类型">
                  <ElSelect v-model="generateAndFillForm.templateType" placeholder="请选择模板类型">
                    <ElOption label="数据报告" value="data" />
                    <ElOption label="法律案件报告" value="legal" />
                    <ElOption label="项目进度报告" value="project" />
                    <ElOption label="会议纪要" value="meeting" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="模板数据 (JSON)">
                  <ElInput v-model="generateAndFillForm.dataJson" type="textarea" :rows="6" placeholder="请输入 JSON 格式的模板数据" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleGenerateAndFill" :loading="loading.generateAndFill">
                    生成并下载
                  </ElButton>
                  <ElButton type="danger" @click="handleCleanup" :loading="loading.cleanup">
                    清理临时模板
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>
        </ElRow>
      </ElTabPane>

      <ElTabPane label="文件管理" name="file">
        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>1. 文件上传</span>
                </div>
              </template>
              <ElForm :model="uploadForm" label-width="120px" inline>
                <ElFormItem label="业务类型">
                  <ElSelect v-model="uploadForm.bizType" placeholder="请选择业务类型">
                    <ElOption label="通用文件" value="common" />
                    <ElOption label="案件文件" value="case" />
                    <ElOption label="债权人文件" value="creditor" />
                    <ElOption label="债务人文件" value="debtor" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="业务ID">
                  <ElInputNumber v-model="uploadForm.bizId" :min="1" />
                </ElFormItem>
                <ElFormItem label="选择文件">
                  <ElUpload :auto-upload="false" :on-change="handleUploadFileChange" :limit="1" :file-list="uploadFileList">
                    <ElButton type="primary">选择文件</ElButton>
                  </ElUpload>
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="success" @click="handleUpload" :loading="loading.upload">
                    上传
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" style="margin-top: 20px">
          <ElCol :span="24">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>2. 文件列表</span>
                </div>
              </template>
              <ElForm :model="queryForm" label-width="120px" inline>
                <ElFormItem label="业务类型">
                  <ElSelect v-model="queryForm.bizType" placeholder="请选择业务类型">
                    <ElOption label="通用文件" value="common" />
                    <ElOption label="案件文件" value="case" />
                    <ElOption label="债权人文件" value="creditor" />
                    <ElOption label="债务人文件" value="debtor" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="业务ID">
                  <ElInputNumber v-model="queryForm.bizId" :min="1" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleQuery" :loading="loading.query">
                    查询
                  </ElButton>
                </ElFormItem>
              </ElForm>
              <ElTable :data="fileList" border style="width: 100%; margin-top: 20px">
                <ElTableColumn prop="id" label="ID" width="80" />
                <ElTableColumn prop="originalFileName" label="文件名" min-width="200" />
                <ElTableColumn prop="fileSize" label="文件大小" width="120">
                  <template #default="{ row }">
                    {{ formatFileSize(row.fileSize) }}
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="fileExtension" label="扩展名" width="100" />
                <ElTableColumn prop="bizType" label="业务类型" width="120" />
                <ElTableColumn prop="bizId" label="业务ID" width="100" />
                <ElTableColumn prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <ElTag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                      {{ row.status }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createTime" label="上传时间" width="180" />
                <ElTableColumn label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <ElButton size="small" @click="handleDownload(row)">
                      下载
                    </ElButton>
                    <ElButton size="small" type="primary" @click="onlyofficeForm.fileId = row.id">
                      选择
                    </ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>
              <ElPagination
                v-model:current-page="queryForm.pageNum"
                v-model:page-size="queryForm.pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleQuery"
                @current-change="handleQuery"
                style="margin-top: 20px; justify-content: center"
              />
            </ElCard>
          </ElCol>
        </ElRow>
      </ElTabPane>

      <ElTabPane label="OnlyOffice 编辑" name="onlyoffice">
        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElCard class="section-card">
              <template #header>
                <div class="card-header">
                  <span>OnlyOffice 操作</span>
                </div>
              </template>
              <ElForm :model="onlyofficeForm" label-width="120px">
                <ElFormItem label="文件ID">
                  <ElInputNumber v-model="onlyofficeForm.fileId" :min="1" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleGetConfig" :loading="loading.getConfig">
                    获取配置并打开编辑器
                  </ElButton>
                  <ElButton type="warning" @click="handleLock" :loading="loading.lock">
                    锁定文件
                  </ElButton>
                  <ElButton type="success" @click="handleUnlock" :loading="loading.unlock">
                    解锁文件
                  </ElButton>
                  <ElButton type="info" @click="handleGetHistory" :loading="loading.getHistory">
                    查看编辑历史
                  </ElButton>
                  <ElButton type="primary" @click="handleGetCollaborators" :loading="loading.getCollaborators">
                    查看协作者
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>
        </ElRow>
      </ElTabPane>
    </ElTabs>

    <ElDialog v-model="editorDialogVisible" title="OnlyOffice 编辑器" width="90%" top="5vh">
      <div v-if="currentEditorConfig" class="editor-container">
        <div class="config-preview">
          <h4>编辑器配置:</h4>
          <pre>{{ JSON.stringify(currentEditorConfig, null, 2) }}</pre>
        </div>
        <div class="editor-placeholder">
          <p>OnlyOffice 编辑器将在此处加载</p>
          <p>提示: 需要在 index.html 中引入 OnlyOffice API 脚本</p>
        </div>
      </div>
      <template #footer>
        <ElButton @click="editorDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="historyDialogVisible" title="编辑历史" width="70%">
      <ElTable :data="editHistory" border>
        <ElTableColumn prop="version" label="版本" width="80" />
        <ElTableColumn prop="editor" label="编辑者" width="150" />
        <ElTableColumn prop="editTime" label="编辑时间" width="180" />
        <ElTableColumn prop="changes" label="变更内容" min-width="200" />
      </ElTable>
      <template #footer>
        <ElButton @click="historyDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="collaboratorsDialogVisible" title="协作者信息" width="70%">
      <ElTable :data="collaborators" border>
        <ElTableColumn prop="id" label="ID" width="100" />
        <ElTableColumn prop="name" label="姓名" width="150" />
        <ElTableColumn prop="email" label="邮箱" width="200" />
        <ElTableColumn prop="isEditing" label="编辑状态" width="120">
          <template #default="{ row }">
            <ElTag :type="row.isEditing ? 'success' : 'info'">
              {{ row.isEditing ? '编辑中' : '空闲' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="lastActive" label="最后活跃时间" width="180" />
      </ElTable>
      <template #footer>
        <ElButton @click="collaboratorsDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.onlyoffice-test-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-card h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.editor-container {
  min-height: 500px;
}

.config-preview {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.config-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.editor-placeholder {
  text-align: center;
  padding: 50px;
  color: #909399;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
}
</style>
