<template>
  <div class="template-manager">
    <!-- 功能操作区域 -->
    <ElCard class="operation-card">
      <template #header>
        <div class="card-header">
          <span>Excel数据导入导出</span>
        </div>
      </template>

      <div class="operation-area">
        <div class="operation-section">
          <h4>1. 下载模板</h4>
          <p class="section-desc">下载Excel模板文件，按照模板格式填写数据</p>
          <ElSelect
            v-model="selectedTemplateForDownload"
            placeholder="选择要下载的模板"
            size="small"
            style="width: 250px; margin-right: 10px"
            clearable
          >
            <ElOption
              v-for="template in templates"
              :key="template.id"
              :label="template.templateName"
              :value="template.templateCode"
            />
          </ElSelect>
          <ElButton type="primary" :icon="Download" @click="handleDownloadTemplate">
            下载模板
          </ElButton>
          <div class="tip-text">不选择则下载默认模板</div>
        </div>

        <ElDivider />

        <div class="operation-section">
          <h4>2. 导入数据</h4>
          <p class="section-desc">上传填写好的Excel文件，将数据导入系统</p>
          <div class="import-options">
            <ElSelect
              v-model="selectedTemplateForImport"
              placeholder="选择导入使用的模板（可选）"
              size="small"
              style="width: 200px; margin-right: 10px"
              clearable
            >
              <ElOption
                v-for="template in templates"
                :key="template.id"
                :label="template.templateName"
                :value="template.templateCode"
              />
            </ElSelect>
            <ElInputNumber
              v-model="sheetIndex"
              :min="0"
              :max="10"
              size="small"
              style="width: 120px; margin-right: 10px"
              placeholder="Sheet索引"
            >
              <template #prefix>Sheet</template>
            </ElInputNumber>
            <ElInput
              v-model="caseIdForImport"
              placeholder="案件ID（可选）"
              size="small"
              style="width: 150px; margin-right: 10px"
            />
          </div>
          <div class="import-actions" style="margin-top: 10px">
            <ElUpload
              ref="uploadRef"
              action="#"
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              class="upload-inline"
            >
              <ElButton type="success" :icon="Upload">选择Excel文件</ElButton>
            </ElUpload>
            <ElButton
              type="primary"
              :icon="UploadFilled"
              :disabled="!selectedFile"
              :loading="importLoading"
              @click="handleImport"
              style="margin-left: 10px"
            >
              开始导入
            </ElButton>
          </div>
          <div class="tip-text">支持 .xlsx 和 .xls 格式，Sheet索引从0开始（第一个Sheet为0）</div>
        </div>

        <ElDivider />

        <div class="operation-section">
          <h4>3. 导出数据</h4>
          <p class="section-desc">将系统中的债权数据导出为Excel文件</p>
          <div class="export-options">
            <ElSelect
              v-model="selectedTemplateForExport"
              placeholder="选择导出使用的模板（必填）"
              size="small"
              style="width: 220px; margin-right: 10px"
              clearable
            >
              <ElOption
                v-for="template in templates"
                :key="template.id"
                :label="template.templateName"
                :value="template.templateCode"
              />
            </ElSelect>
            <ElInput
              v-model="caseIdForExport"
              placeholder="案件ID（可选）"
              size="small"
              style="width: 150px; margin-right: 10px"
            />
            <ElSelect
              v-model="registrationStatusForExport"
              placeholder="登记状态（可选）"
              size="small"
              style="width: 150px; margin-right: 10px"
              clearable
            >
              <ElOption label="待审核" value="PENDING" />
              <ElOption label="已通过" value="APPROVED" />
              <ElOption label="已拒绝" value="REJECTED" />
            </ElSelect>
          </div>
          <div class="export-actions" style="margin-top: 10px">
            <ElButton
              type="warning"
              :icon="Document"
              :disabled="!selectedTemplateForExport"
              @click="handleExport"
            >
              导出数据
            </ElButton>
          </div>
          <div class="tip-text">必须先选择模板，可按案件ID和登记状态过滤导出</div>
        </div>
      </div>
    </ElCard>

    <!-- 导入结果对话框 -->
    <ElDialog v-model="importResultVisible" title="导入结果" width="600px">
      <div v-if="importResult" class="import-result">
        <ElResult
          :icon="importResult.failCount > 0 ? 'warning' : 'success'"
          :title="importResult.failCount > 0 ? '部分导入成功' : '导入成功'"
        >
          <template #sub-title>
            <div class="result-stats">
              <p>总记录数：<strong>{{ importResult.totalCount }}</strong></p>
              <p>成功导入：<strong style="color: #67c23a">{{ importResult.successCount }}</strong></p>
              <p>导入失败：<strong style="color: #f56c6c">{{ importResult.failCount }}</strong></p>
            </div>
            <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
              <p style="color: #f56c6c; margin-top: 10px">错误详情：</p>
              <ElTable :data="importResult.errors" size="small" style="width: 100%; margin-top: 10px" max-height="200">
                <ElTableColumn prop="row" label="行号" width="80" />
                <ElTableColumn prop="message" label="错误信息" />
              </ElTable>
            </div>
          </template>
        </ElResult>
      </div>
    </ElDialog>

    <ElCard style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>Excel导入模板管理</span>
          <ElButton type="primary" @click="showCreateDialog" :icon="Plus">
            新建模板
          </ElButton>
        </div>
      </template>

      <ElTable :data="templates" style="width: 100%">
        <ElTableColumn prop="templateName" label="模板名称" width="200" />
        <ElTableColumn prop="templateCode" label="模板编码" width="150" />
        <ElTableColumn prop="description" label="描述" width="300" />
        <ElTableColumn prop="isDefault" label="是否默认" width="100">
          <template #default="scope">
            <ElTag v-if="scope.row.isDefault" type="success">默认</ElTag>
            <ElTag v-else type="info">普通</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="isActive" label="状态" width="100">
          <template #default="scope">
            <ElSwitch v-model="scope.row.isActive" @change="toggleTemplate(scope.row)" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="250" fixed="right">
          <template #default="scope">
            <ElButton size="small" @click="showEditDialog(scope.row)">编辑</ElButton>
            <ElButton size="small" type="primary" @click="setDefault(scope.row)" v-if="!scope.row.isDefault">
              设为默认
            </ElButton>
            <ElButton size="small" type="danger" @click="deleteTemplate(scope.row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 创建/编辑模板对话框 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="1000px">
      <ElForm :model="templateForm" :rules="formRules" label-width="120px">
        <ElFormItem label="模板名称" prop="templateName">
          <ElInput v-model="templateForm.templateName" placeholder="请输入模板名称" />
          <div class="form-tip">模板的显示名称，用于在列表中标识此模板</div>
        </ElFormItem>

        <ElFormItem label="模板编码" prop="templateCode">
          <ElInput
            v-model="templateForm.templateCode"
            placeholder="请输入模板编码"
            :disabled="!!templateForm.id"
          />
          <div class="form-tip">
            <strong>模板编码是模板的唯一标识符</strong>，创建后不可修改。<br>
            建议使用英文小写字母和数字的组合，例如：default、custom、template_v1 等。<br>
            在导入Excel时，系统通过此编码来识别和匹配对应的模板配置。
          </div>
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput v-model="templateForm.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
          <div class="form-tip">对此模板的详细说明，帮助其他用户了解该模板适用的场景和Excel格式要求</div>
        </ElFormItem>

        <ElFormItem label="字段映射">
          <div class="mapping-section">
            <div class="mapping-description">
              <ElAlert type="info" :closable="false">
                <template #title>
                  <strong>字段映射说明</strong>
                </template>
                <div class="mapping-help">
                  <p>字段映射用于建立<strong>Excel表头</strong>与<strong>系统字段</strong>之间的对应关系。</p>
                  <p><strong>便捷操作：</strong>选择系统字段后，Excel表头会自动填充为对应的中文名称，您可以根据实际Excel文件进行修改。</p>
                  <p>配置步骤：</p>
                  <ol>
                    <li>在右侧选择对应的系统字段（如"creditorName"、"contactPhone"等）</li>
                    <li>左侧会自动填充对应的中文名称（如"债权人名称"、"联系电话"）</li>
                    <li>根据实际Excel文件的表头名称进行调整</li>
                    <li>可以添加多组映射关系，系统会自动匹配Excel中的数据</li>
                  </ol>
                  <p class="mapping-example">
                    <strong>示例：</strong>如果您的Excel表头是"债权人"，系统字段选择"creditorName"，
                    导入时系统会将"债权人"列的数据自动填充到债权人信息表的"债权人名称"字段中。
                  </p>
                </div>
              </ElAlert>
            </div>

            <div class="mapping-editor">
              <div class="mapping-header">
                <span class="header-label">Excel表头</span>
                <span class="header-label">对应系统字段</span>
                <span class="header-label">操作</span>
              </div>

              <div v-for="(mapping, index) in templateForm.mappings" :key="index" class="mapping-row">
                <ElInput
                  v-model="mapping.excelHeader"
                  placeholder="输入Excel中的列标题"
                  size="small"
                  style="width: 220px"
                />
                <ElSelect
                  v-model="mapping.targetField"
                  placeholder="选择系统字段"
                  size="small"
                  style="width: 280px"
                  @change="(value: string) => onFieldSelect(index, value)"
                >
                  <ElOptionGroup
                    v-for="group in systemFieldGroups"
                    :key="group.group"
                    :label="group.group"
                  >
                    <ElOption
                      v-for="field in group.fields"
                      :key="field.value"
                      :label="field.label"
                      :value="field.value"
                    />
                  </ElOptionGroup>
                </ElSelect>
                <ElButton size="small" type="danger" :icon="Delete" @click="removeMapping(index)">
                  删除
                </ElButton>
              </div>

              <ElButton size="small" type="primary" :icon="Plus" @click="addMapping" class="add-mapping-btn">
                添加字段映射
              </ElButton>
            </div>
          </div>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveTemplate">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElCard, ElButton, ElTable, ElTableColumn, ElTag, ElSwitch, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption, ElOptionGroup, ElAlert, ElUpload, ElDivider, ElResult } from 'element-plus';
import { Plus, Delete, Download, Upload, UploadFilled, Document } from '@element-plus/icons-vue';
import { excelTemplatesApi } from '#/api/core/excel-templates';
import type { UploadFile, UploadInstance } from 'element-plus';

const message = ElMessage;
const templates = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新建模板');
const templateForm = ref({
  id: '',
  templateName: '',
  templateCode: '',
  description: '',
  mappings: [] as { excelHeader: string; targetField: string }[]
});

// 导入导出相关
const selectedTemplateForDownload = ref('');
const selectedTemplateForImport = ref('');
const selectedTemplateForExport = ref('');
const selectedFile = ref<File | null>(null);
const uploadRef = ref<UploadInstance>();
const importLoading = ref(false);
const importResultVisible = ref(false);
const sheetIndex = ref(0);
const caseIdForImport = ref('');
const caseIdForExport = ref('');
const registrationStatusForExport = ref('');
const importResult = ref<{
  successCount: number;
  failCount: number;
  totalCount: number;
  message: string;
  errors: Array<{
    row: number;
    message: string;
    data: string;
  }>;
  templateCode: string;
  caseId?: number;
} | null>(null);

const formRules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' }
  ]
};

// 系统字段分组（从后端获取）
const systemFieldGroups = ref<Array<{
  group: string;
  fields: Array<{
    label: string;
    value: string;
    sortOrder: number;
    description?: string;
  }>;
}>>([]);

// 字段名称映射表：系统字段值 -> 中文显示名称（动态生成）
const fieldNameMapping = ref<Record<string, string>>({});

// 加载系统字段
const loadSystemFields = async () => {
  try {
    const response = await excelTemplatesApi.getSystemFields();
    if (response.code === 200) {
      systemFieldGroups.value = response.data || [];

      // 动态生成字段名称映射表
      const mapping: Record<string, string> = {};
      response.data.forEach((group) => {
        group.fields.forEach((field) => {
          // 从 label 中提取中文名称（去掉括号内的英文）
          const chineseName = field.label.replace(/\s*\([^)]*\)\s*$/, '').trim();
          mapping[field.value] = chineseName;
        });
      });
      fieldNameMapping.value = mapping;
    }
  } catch (error) {
    console.error('加载系统字段失败:', error);
    message.error('加载系统字段失败');
  }
};

// 当选择系统字段时，自动填充Excel表头
const onFieldSelect = (index: number, fieldValue: string) => {
  const mapping = templateForm.value.mappings[index];
  if (mapping && fieldValue) {
    // 只有当Excel表头为空时，才自动填充
    if (!mapping.excelHeader) {
      mapping.excelHeader = fieldNameMapping.value[fieldValue] || fieldValue;
    }
  }
};

// 将 fieldMappings 转换为数组格式的辅助函数
const convertFieldMappingsToArray = (fieldMappings: any): { excelHeader: string; targetField: string }[] => {
  if (!fieldMappings) return [];

  // 如果是字符串，先解析为对象
  let mappingsObj = fieldMappings;
  if (typeof fieldMappings === 'string') {
    try {
      mappingsObj = JSON.parse(fieldMappings);
    } catch (e) {
      console.error('解析 fieldMappings 失败:', e);
      return [];
    }
  }

  // 如果已经是数组，直接返回
  if (Array.isArray(mappingsObj)) {
    return mappingsObj;
  }

  // 如果是对象，转换为数组
  if (typeof mappingsObj === 'object') {
    return Object.entries(mappingsObj).map(([excelHeader, targetField]) => ({
      excelHeader,
      targetField: targetField as string
    }));
  }

  return [];
};

const loadTemplates = async () => {
  try {
    console.log('开始加载模板...');
    const response = await excelTemplatesApi.getTemplates();
    console.log('API Response:', response);

    // 检查 response 结构
    if (response) {
      // 直接检查 response.code，因为 requestClient8085 返回的就是后端响应体
      if (response.code === 200) {
        console.log('准备赋值给 templates:', response.data);
        templates.value = response.data || [];
        console.log('赋值后 templates.value:', templates.value);
        console.log('templates.value.length:', templates.value.length);
      } else {
        console.log('API 返回错误:', response.message);
        message.error(response.message || '加载模板失败');
        templates.value = [];
      }
    } else {
      console.log('API 返回格式错误:', response);
      message.error('API 返回格式错误');
      templates.value = [];
    }
  } catch (error) {
    console.error('加载模板失败:', error);
    message.error('加载模板失败');
    templates.value = [];
  }
};

const showCreateDialog = () => {
  dialogTitle.value = '新建模板';
  templateForm.value = {
    id: '',
    templateName: '',
    templateCode: '',
    description: '',
    mappings: []
  };
  dialogVisible.value = true;
};

const showEditDialog = (template: any) => {
  dialogTitle.value = '编辑模板';
  templateForm.value = {
    ...template,
    mappings: convertFieldMappingsToArray(template.fieldMappings)
  };
  dialogVisible.value = true;
};

const addMapping = () => {
  templateForm.value.mappings.push({
    excelHeader: '',
    targetField: ''
  });
};

const removeMapping = (index: number) => {
  templateForm.value.mappings.splice(index, 1);
};

const saveTemplate = async () => {
  try {
    const fieldMappings = templateForm.value.mappings.reduce((acc: any, mapping) => {
      if (mapping.excelHeader && mapping.targetField) {
        acc[mapping.excelHeader] = mapping.targetField;
      }
      return acc;
    }, {});

    const request = {
      templateName: templateForm.value.templateName,
      templateCode: templateForm.value.templateCode,
      description: templateForm.value.description,
      fieldMappings
    };

    let response;
    if (templateForm.value.id) {
      response = await excelTemplatesApi.updateTemplate(templateForm.value.id, request);
    } else {
      response = await excelTemplatesApi.createTemplate(request);
    }

    console.log('Save Template Response:', response);
    if (response.code === 200) {
      message.success(templateForm.value.id ? '保存成功' : '创建成功');
      dialogVisible.value = false;
      loadTemplates();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('保存模板失败:', error);
    message.error('操作失败');
  }
};

const setDefault = async (template: any) => {
  try {
    const response = await excelTemplatesApi.setDefaultTemplate(template.id);
    console.log('Set Default Response:', response);
    if (response.code === 200) {
      message.success('设置成功');
      loadTemplates();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('设置默认模板失败:', error);
    message.error('操作失败');
  }
};

const deleteTemplate = async (template: any) => {
  try {
    const response = await excelTemplatesApi.deleteTemplate(template.id);
    console.log('Delete Template Response:', response);
    if (response.code === 200) {
      message.success('删除成功');
      loadTemplates();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('删除模板失败:', error);
    message.error('操作失败');
  }
};

const toggleTemplate = async (template: any) => {
  try {
    const response = await excelTemplatesApi.updateTemplate(template.id, {
      isActive: template.isActive
    });
    console.log('Toggle Template Response:', response);
    if (response.code === 200) {
      message.success('操作成功');
    } else {
      message.error(response.message || '操作失败');
      loadTemplates(); // 恢复原始状态
    }
  } catch (error) {
    console.error('切换模板状态失败:', error);
    message.error('操作失败');
    loadTemplates(); // 恢复原始状态
  }
};

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const response = await excelTemplatesApi.downloadTemplate(
      selectedTemplateForDownload.value || undefined
    );

    // 创建下载链接
    const blob = new Blob([response as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // 设置文件名
    const templateName = selectedTemplateForDownload.value
      ? templates.value.find(t => t.templateCode === selectedTemplateForDownload.value)?.templateName || 'template'
      : 'default_template';
    link.download = `${templateName}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    message.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    message.error('下载模板失败');
  }
};

// 文件选择变化
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
  }
};

// 文件移除
const handleFileRemove = () => {
  selectedFile.value = null;
};

// 导入Excel
const handleImport = async () => {
  if (!selectedFile.value) {
    message.warning('请先选择Excel文件');
    return;
  }

  importLoading.value = true;
  try {
    const response = await excelTemplatesApi.importExcel(
      selectedFile.value,
      selectedTemplateForImport.value || undefined,
      caseIdForImport.value || undefined,
      sheetIndex.value
    );

    if (response.code === 200) {
      importResult.value = response.data;
      importResultVisible.value = true;

      // 清空文件选择
      selectedFile.value = null;
      uploadRef.value?.clearFiles();

      if (response.data.failCount === 0) {
        message.success(`成功导入 ${response.data.successCount} 条数据`);
      } else {
        message.warning(`导入完成，成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`);
      }
    } else {
      message.error(response.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    message.error('导入失败，请检查文件格式');
  } finally {
    importLoading.value = false;
  }
};

// 导出数据
const handleExport = async () => {
  if (!selectedTemplateForExport.value) {
    message.warning('请先选择导出模板');
    return;
  }

  try {
    const response = await excelTemplatesApi.exportData(
      selectedTemplateForExport.value,
      caseIdForExport.value || undefined,
      registrationStatusForExport.value || undefined
    );

    // 创建下载链接
    const blob = new Blob([response as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // 设置文件名
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const templateName = templates.value.find(t => t.templateCode === selectedTemplateForExport.value)?.templateCode || 'export';
    link.download = `${templateName}_${timestamp}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    message.success('数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    message.error('导出数据失败');
  }
};

onMounted(() => {
  loadTemplates();
  loadSystemFields();
});
</script>

<style scoped>
.template-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 操作区域样式 */
.operation-card {
  margin-bottom: 20px;
}

.operation-area {
  padding: 10px 0;
}

.operation-section {
  padding: 15px 0;
}

.operation-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.section-desc {
  color: #909399;
  font-size: 13px;
  margin: 0 0 15px 0;
}

.tip-text {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.upload-inline {
  display: inline-block;
}

/* 导入结果样式 */
.import-result {
  padding: 20px;
}

.result-stats {
  text-align: center;
  margin: 20px 0;
}

.result-stats p {
  margin: 10px 0;
  font-size: 14px;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
  background-color: #fef0f0;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
}

.error-list ul {
  margin: 5px 0;
  padding-left: 20px;
}

.error-list li {
  color: #f56c6c;
  font-size: 12px;
  margin: 3px 0;
}

/* 表单提示文字样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.6;
}

.form-tip strong {
  color: #409eff;
}

/* 字段映射区域样式 */
.mapping-section {
  width: 100%;
}

.mapping-description {
  margin-bottom: 20px;
}

.mapping-help {
  font-size: 13px;
  line-height: 1.8;
}

.mapping-help p {
  margin: 8px 0;
}

.mapping-help ol {
  margin: 8px 0;
  padding-left: 20px;
}

.mapping-help li {
  margin: 4px 0;
}

.mapping-example {
  background-color: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 12px;
  border-left: 3px solid #409eff;
}

/* 映射编辑器样式 */
.mapping-editor {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.mapping-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.header-label {
  flex: 1;
  font-weight: bold;
  color: #606266;
  font-size: 14px;
}

.header-label:last-child {
  flex: 0 0 80px;
  text-align: center;
}

.mapping-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.add-mapping-btn {
  margin-top: 10px;
}

/* 调整表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
