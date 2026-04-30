<!-- TODO: 该页面已改为功能建设中展示，以下是原有完整代码，待后续功能恢复时启用 -->
<template>
  <Fallback
    status="coming-soon"
    title="功能建设中"
    description="敬请期待"
  />
</template>

<script lang="ts" setup>
import { Fallback } from '@vben/common-ui';
</script>

<style scoped>
/* 以下是原有页面样式，保留供后续恢复使用 */
</style>

<!-- 
===========================================================================
以下是原始模板管理页面完整代码，已注释保留，待功能恢复时启用
===========================================================================

<template>
  <div class="template-management">
    <div class="page-header">
      <div class="header-title">
        <h2>模板管理</h2>
        <p class="subtitle">统一管理Word和Excel模板，支持表单设计、数据导入导出和系统字段管理</p>
      </div>
    </div>

    <ElTabs v-model="activeTab" class="template-tabs">
      <ElTabPane label="模板管理" name="template-management">
        <div class="stats-cards">
          <ElCard class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">模板总数</div>
          </ElCard>
          <ElCard class="stat-card">
            <div class="stat-value">{{ stats.word }}</div>
            <div class="stat-label">Word模板</div>
          </ElCard>
          <ElCard class="stat-card">
            <div class="stat-value">{{ stats.excel }}</div>
            <div class="stat-label">Excel模板</div>
          </ElCard>
          <ElCard class="stat-card">
            <div class="stat-value">{{ stats.default }}</div>
            <div class="stat-label">默认模板</div>
          </ElCard>
        </div>

        <ElCard class="template-list-card">
          <template #header>
            <div class="card-header">
              <span>模板列表</span>
              <div class="header-actions">
                <ElRadioGroup v-model="filterType" size="small" @change="handleFilterChange">
                  <ElRadioButton value="">全部</ElRadioButton>
                  <ElRadioButton value="WORD">Word</ElRadioButton>
                  <ElRadioButton value="EXCEL">Excel</ElRadioButton>
                </ElRadioGroup>
                <ElButton type="primary" :icon="Plus" @click="showCreateDialog">
                  新建模板
                </ElButton>
              </div>
            </div>
          </template>

          <ElTable :data="filteredTemplates" v-loading="loading" style="width: 100%">
            <ElTableColumn type="index" width="50" />
            <ElTableColumn prop="templateName" label="模板名称" min-width="180">
              <template #default="scope">
                <div class="template-name-cell">
                  <ElIcon :size="20" class="template-icon">
                    <Document v-if="scope.row.templateType === 'WORD'" />
                    <Grid v-else />
                  </ElIcon>
                  <div class="template-info">
                    <div class="template-name">{{ scope.row.templateName }}</div>
                    <div class="template-code">{{ scope.row.templateCode }}</div>
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="templateType" label="类型" width="100">
              <template #default="scope">
                <ElTag :type="scope.row.templateType === 'WORD' ? 'primary' : 'success'">
                  {{ scope.row.templateType === 'WORD' ? 'Word' : 'Excel' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <ElTableColumn prop="isDefault" label="默认" width="80">
              <template #default="scope">
                <ElTag v-if="scope.row.isDefault" type="success">默认</ElTag>
                <span v-else>-</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="filePath" label="模板文件" width="120">
              <template #default="scope">
                <ElTag v-if="scope.row.filePath" type="success">
                  <ElIcon><Document /></ElIcon> 已上传
                </ElTag>
                <ElTag v-else type="info">未上传</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="状态" width="100">
              <template #default="scope">
                <ElSwitch
                  v-model="scope.row.status"
                  active-value="ACTIVE"
                  inactive-value="INACTIVE"
                  @change="(val) => handleStatusChange(scope.row, val)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="更新时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.updateTime) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="280" fixed="right">
              <template #default="scope">
                <ElButton size="small" @click="showEditDialog(scope.row)">编辑</ElButton>
                <ElButton size="small" type="primary" @click="showDesignDialog(scope.row)">设计</ElButton>
                <ElButton
                  size="small"
                  type="info"
                  @click="showPreviewDialog(scope.row)"
                  v-if="scope.row.templateType === 'WORD'"
                >预览</ElButton>
                <ElButton
                  size="small"
                  type="success"
                  @click="showExportDialog(scope.row)"
                >导出</ElButton>
                <ElDropdown trigger="click" @command="(cmd) => handleCommand(cmd, scope.row)">
                  <ElButton size="small">
                    更多<ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                  </ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="upload">上传文件</ElDropdownItem>
                      <ElDropdownItem command="setDefault" :disabled="scope.row.isDefault">
                        设为默认
                      </ElDropdownItem>
                      <ElDropdownItem command="history">导出历史</ElDropdownItem>
                      <ElDropdownItem command="delete" divided type="danger">删除</ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElTabPane>

      <ElTabPane label="表单设计" name="form-design">
        <ElCard class="form-designer-card">
          <template #header>
            <div class="card-header">
              <span>表单设计器</span>
              <div class="header-actions">
                <ElSelect
                  v-model="selectedTemplateForDesign"
                  placeholder="选择要设计的模板"
                  style="width: 250px; margin-right: 10px"
                >
                  <ElOption
                    v-for="template in templates"
                    :key="template.id"
                    :label="template.templateName"
                    :value="template"
                  />
                </ElSelect>
                <ElButton type="primary" :icon="View" @click="showFormDesignerDialog">
                  打开表单设计器
                </ElButton>
              </div>
            </div>
          </template>
          <div class="designer-intro">
            <ElAlert type="info" :closable="false">
              <template #title>
                <strong>表单设计器功能说明</strong>
              </template>
              <div class="intro-content">
                <p>通过拖拉拽方式设计模板对应的表单结构，支持以下功能：</p>
                <ul>
                  <li>从左侧组件库拖拽组件到设计区</li>
                  <li>支持字段排序、复制、删除</li>
                  <li>配置字段属性（标题、必填、选项等）</li>
                  <li>实时预览表单效果</li>
                  <li>保存表单配置并与模板关联</li>
                </ul>
              </div>
            </ElAlert>
          </div>
        </ElCard>
      </ElTabPane>

      <ElTabPane label="模板制作" name="template-maker">
        <ElCard class="template-maker-card">
          <template #header>
            <div class="card-header">
              <span>前端模板制作</span>
              <div class="header-actions">
                <ElSelect
                  v-model="selectedTemplateForMaker"
                  placeholder="选择要编辑的模板"
                  style="width: 250px; margin-right: 10px"
                  @change="loadTemplateForMaker"
                >
                  <ElOption
                    v-for="template in templates"
                    :key="template.id"
                    :label="template.templateName"
                    :value="template"
                  />
                </ElSelect>
                <ElButton type="primary" :icon="Plus" @click="createNewTemplate">
                  新建模板
                </ElButton>
              </div>
            </div>
          </template>
          
          <div class="template-maker-content">
            <div v-if="!currentTemplateForMaker" class="empty-state">
              <ElIcon class="empty-icon"><Document /></ElIcon>
              <h3>请选择或新建模板</h3>
              <p>选择一个现有模板进行编辑，或创建一个新的模板</p>
            </div>
            <div v-else class="template-editor">
              <ElForm :model="templateMakerForm" label-width="120px" class="template-info-form">
                <ElRow :gutter="20">
                  <ElCol :span="12">
                    <ElFormItem label="模板名称">
                      <ElInput v-model="templateMakerForm.templateName" placeholder="请输入模板名称" />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="模板编码">
                      <ElInput v-model="templateMakerForm.templateCode" placeholder="请输入模板编码" :disabled="!!currentTemplateForMaker.id" />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="24">
                    <ElFormItem label="模板描述">
                      <ElInput v-model="templateMakerForm.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElForm>
              
              <div class="template-content-editor">
                <h4>模板内容编辑</h4>
                <div class="editor-toolbar">
                  <ElButton size="small" @click="insertPlaceholder">
                    <ElIcon><Plus /></ElIcon>插入占位符
                  </ElButton>
                  <ElButton size="small" @click="previewTemplateContent">
                    <ElIcon><View /></ElIcon>预览
                  </ElButton>
                </div>
                <div class="editor-container">
                  <div class="rich-editor">
                    <Toolbar
                      :editor="editor"
                      :default-config="toolbarConfig"
                      style="border-bottom: 1px solid #ccc"
                    />
                    <Editor
                      v-model="templateMakerForm.content"
                      :default-config="editorConfig"
                      style="height: 400px; overflow-y: auto"
                      @onCreated="onEditorCreated"
                      @onChange="onEditorChange"
                    />
                  </div>
                </div>
              </div>
              
              <div class="template-fields">
                <h4>字段管理</h4>
                <ElButton type="primary" size="small" @click="addField">
                  <ElIcon><Plus /></ElIcon>添加字段
                </ElButton>
                <ElTable :data="templateMakerForm.fields" style="margin-top: 15px">
                  <ElTableColumn prop="fieldName" label="字段名称" width="180" />
                  <ElTableColumn prop="fieldLabel" label="字段标签" width="180" />
                  <ElTableColumn prop="fieldType" label="字段类型" width="120" />
                  <ElTableColumn prop="formatPattern" label="格式模式" />
                  <ElTableColumn label="操作" width="120">
                    <template #default="scope">
                      <ElButton size="small" @click="editField(scope.row)">编辑</ElButton>
                      <ElButton size="small" type="danger" @click="removeField(scope.$index)">删除</ElButton>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>
              
              <div class="template-actions" style="margin-top: 20px">
                <ElButton type="primary" @click="saveTemplateMaker">保存模板</ElButton>
                <ElButton @click="resetTemplateMaker">重置</ElButton>
              </div>
            </div>
          </div>
        </ElCard>
      </ElTabPane>

      <ElTabPane label="数据导入导出" name="data-import-export">
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
              <p class="section-desc">将系统中的数据导出为Excel文件</p>
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
      </ElTabPane>

      <ElTabPane label="系统字段管理" name="system-fields">
        <ElCard style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>系统字段管理</span>
              <div class="header-actions">
                <ElInput
                  v-model="fieldSearchQuery"
                  placeholder="搜索字段（名称、值、分组）"
                  style="width: 300px; margin-right: 10px"
                  clearable
                  @input="handleSystemFieldSearch"
                >
                  <template #prefix>
                    <ElIcon class="el-input__icon"><Search /></ElIcon>
                  </template>
                </ElInput>
                <ElSelect
                  v-model="selectedGroup"
                  placeholder="按分组筛选"
                  style="width: 150px; margin-right: 10px"
                  clearable
                  @change="handleGroupChange"
                >
                  <ElOption label="全部分组" value="" />
                  <ElOption
                    v-for="group in availableGroups"
                    :key="group"
                    :label="group"
                    :value="group"
                  />
                </ElSelect>
                <ElButton type="primary" @click="showCreateFieldDialog" :icon="Plus">
                  新建字段
                </ElButton>
              </div>
            </div>
          </template>

          <ElTable :data="pagedSystemFields" style="width: 100%">
            <ElTableColumn prop="groupName" label="分组" width="150" />
            <ElTableColumn prop="label" label="字段名称" width="150" />
            <ElTableColumn prop="value" label="字段值" width="150" />
            <ElTableColumn prop="sortOrder" label="排序" width="80" />
            <ElTableColumn prop="description" label="描述" width="300" />
            <ElTableColumn label="操作" width="150" fixed="right">
              <template #default="scope">
                <ElButton size="small" @click="showEditFieldDialog(scope.row)">编辑</ElButton>
                <ElButton size="small" type="danger" @click="deleteField(scope.row)">删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="pagination-container">
            <ElPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredSystemFields.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </ElCard>
      </ElTabPane>
    </ElTabs>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="formRef"
        :model="templateForm"
        :rules="formRules"
        label-width="100px"
      >
        <ElFormItem label="模板名称" prop="templateName">
          <ElInput v-model="templateForm.templateName" placeholder="请输入模板名称" />
        </ElFormItem>
        <ElFormItem label="模板编码" prop="templateCode">
          <ElInput
            v-model="templateForm.templateCode"
            placeholder="请输入模板编码，如：CLAIM_CONTRACT_001"
            :disabled="!!templateForm.id"
          />
          <div class="form-tip">模板编码必须唯一，创建后不可修改</div>
        </ElFormItem>
        <ElFormItem label="模板类型" prop="templateType">
          <ElRadioGroup v-model="templateForm.templateType" :disabled="!!templateForm.id">
            <ElRadioButton value="WORD">Word文档</ElRadioButton>
            <ElRadioButton value="EXCEL">Excel表格</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="模板描述">
          <ElInput
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </ElFormItem>
        <ElFormItem label="页面配置">
          <div class="config-input-wrapper">
            <ElInput
              v-model="templateForm.configJson"
              type="textarea"
              :rows="2"
              placeholder='{"layout": "A4", "orientation": "portrait"}'
            />
            <ElButton type="primary" link size="small" @click="showConfigTemplateDialog">
              选择模板
            </ElButton>
          </div>
          <div class="form-tip">JSON格式，用于配置页面布局等参数</div>
        </ElFormItem>
        <ElFormItem label="设为默认">
          <ElSwitch v-model="templateForm.isDefault" />
        </ElFormItem>
        
        <ElFormItem label="字段映射" v-if="templateForm.templateType === 'EXCEL'">
          <div class="mapping-section">
            <div class="mapping-description">
              <ElAlert type="info" :closable="false">
                <template #title>
                  <strong>字段映射说明</strong>
                </template>
                <div class="mapping-help">
                  <p>字段映射用于建立Excel表头与系统字段之间的对应关系。</p>
                  <p>便捷操作：选择系统字段后，Excel表头会自动填充为对应的中文名称，您可以根据实际Excel文件进行修改。</p>
                  <p>配置步骤：</p>
                  <ol>
                    <li>在右侧选择对应的系统字段（如"creditorName"、"contactPhone"等）</li>
                    <li>左侧会自动填充对应的中文名称（如"债权人名称"、"联系电话"等）</li>
                    <li>根据实际Excel文件的表头名称进行调整</li>
                    <li>可以添加多组映射关系，系统会自动匹配Excel中的数据</li>
                  </ol>
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
                  placeholder="选择系统字段（支持搜索）"
                  size="small"
                  style="width: 280px"
                  filterable
                  :remote="true"
                  :remote-method="(query) => handleFieldSelectorSearch(index, query)"
                  :loading="fieldSearchLoadingValue[index] || false"
                  @change="(value: string) => onFieldSelect(index, value)"
                >
                  <ElOptionGroup
                    v-for="group in ((fieldSelectorFieldGroupsValue[index] || systemFieldGroups.value) || [])"
                    :key="group?.group || 'default'"
                    :label="group?.group || '默认分组'"
                  >
                    <ElOption
                      v-for="field in (group?.fields || [])"
                      :key="field?.value || Math.random()"
                      :label="field?.label || ''"
                      :value="field?.value || ''"
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
        <ElButton type="primary" @click="saveTemplate" :loading="saving">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="designerVisible"
      title="模板表单设计器"
      width="1300px"
      :close-on-click-modal="false"
      class="designer-dialog"
      destroy-on-close
    >
      <div class="designer-info" v-if="currentTemplate">
        <ElAlert type="info" :closable="false">
          <template #title>
            当前模板: {{ currentTemplate.templateName }} ({{ currentTemplate.templateCode }})
          </template>
          <div>类型: {{ currentTemplate.templateType === 'WORD' ? 'Word文档' : 'Excel表格' }}</div>
        </ElAlert>
      </div>
      <DocumentFormDesigner
        ref="designerRef"
        :initial-template-type="currentTemplate?.templateType"
        style="height: 600px"
      />
      <template #footer>
        <ElButton @click="designerVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveDesignerConfig" :loading="saving">
          保存字段配置
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="exportVisible"
      title="导出文档"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="export-info" v-if="currentTemplate">
        <ElAlert type="info" :closable="false">
          <template #title>
            导出模板: {{ currentTemplate.templateName }}
          </template>
          <div>类型: {{ currentTemplate.templateType === 'WORD' ? 'Word文档' : 'Excel表格' }}</div>
        </ElAlert>
      </div>
      <ElForm label-width="100px">
        <ElFormItem label="文件名称">
          <ElInput v-model="exportForm.fileName" placeholder="请输入导出文件名" />
        </ElFormItem>
        
        <ElFormItem label="导出格式" v-if="currentTemplate?.templateType === 'WORD'">
          <ElRadioGroup v-model="exportFormat">
            <ElRadioButton value="word">Word文档</ElRadioButton>
            <ElRadioButton value="pdf">PDF文档</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        
        <ElFormItem label="导出数据">
          <div v-if="templateFields.length > 0" class="dynamic-fields">
            <div v-for="field in templateFields" :key="field.key" class="field-item">
              <div class="field-label">
                {{ field.label }}
                <span v-if="field.required" class="required-mark">*</span>
                <ElTag size="small" type="info" style="margin-left: 8px">{{ getFieldTypeLabel(field.fieldType) }}</ElTag>
              </div>
              
              <ElInput 
                v-if="field.fieldType === 'TEXT'"
                v-model="fieldValues[field.key]" 
                :placeholder="`请输入${field.label}`"
                :required="field.required"
                style="flex: 1"
              />
              
              <ElInputNumber
                v-else-if="field.fieldType === 'NUMBER'"
                v-model="fieldValues[field.key]"
                :placeholder="`请输入${field.label}`"
                style="flex: 1"
                controls-position="right"
              />
              
              <ElDatePicker
                v-else-if="field.fieldType === 'DATE'"
                v-model="fieldValues[field.key]"
                type="date"
                :placeholder="`请选择${field.label}`"
                style="flex: 1"
                value-format="YYYY-MM-DD"
              />
              
              <ElSelect
                v-else-if="field.fieldType === 'LIST'"
                v-model="fieldValues[field.key]"
                :placeholder="`请选择${field.label}`"
                style="flex: 1"
                allow-create
                filterable
              >
                <ElOption
                  v-for="option in getListOptions(field.formatPattern)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
              
              <div v-else-if="field.fieldType === 'IMAGE'" class="image-upload-field">
                <ElInput 
                  v-model="fieldValues[field.key]" 
                  placeholder="请输入图片URL或上传图片"
                  style="flex: 1"
                />
                <ElUpload
                  :show-file-list="false"
                  :before-upload="(file: File) => handleFieldImageUpload(field.key, file, field.imageType)"
                  accept="image/*"
                >
                  <ElButton type="primary" :icon="Upload" style="margin-left: 8px">上传图片</ElButton>
                </ElUpload>
                <div v-if="fieldValues[field.key]" class="image-preview-small">
                  <img :src="fieldValues[field.key]" alt="预览" />
                </div>
              </div>
              
              <ElInput
                v-else-if="field.fieldType === 'TABLE'"
                v-model="fieldValues[field.key]"
                type="textarea"
                :rows="3"
                :placeholder="`请输入${field.label}（JSON格式）`"
                style="flex: 1"
              />
              
              <ElInput 
                v-else
                v-model="fieldValues[field.key]" 
                :placeholder="`请输入${field.label}`"
                style="flex: 1"
              />
            </div>
          </div>
          <div v-else class="no-fields">
            <ElAlert type="info" :closable="false">
              该模板暂无字段配置，请先在表单设计中添加字段
            </ElAlert>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="exportVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTemplateExport" :loading="exporting">
          导出
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="uploadVisible"
      title="上传模板文件"
      width="500px"
    >
      <div v-if="currentTemplate" class="upload-info">
        <ElAlert type="info" :closable="false">
          <template #title>
            模板: {{ currentTemplate.templateName }}
          </template>
          <div>编码: {{ currentTemplate.templateCode }}</div>
        </ElAlert>
        
        <div v-if="currentTemplate.filePath" class="current-file-info">
          <h4>当前已关联文件</h4>
          <div class="file-detail">
            <ElIcon class="file-icon"><Document /></ElIcon>
            <div class="file-meta">
              <div class="file-name">{{ getFileNameFromPath(currentTemplate.filePath) }}</div>
              <div class="file-path">{{ currentTemplate.filePath }}</div>
            </div>
          </div>
          <ElAlert type="warning" :closable="false" style="margin-top: 10px">
            上传新文件将替换当前文件
          </ElAlert>
        </div>
        <div v-else class="no-file-info">
          <ElAlert type="info" :closable="false">
            该模板暂未关联文件，请上传模板文件
          </ElAlert>
        </div>
      </div>
      
      <ElUpload
        ref="uploadRef"
        drag
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        accept=".docx,.xlsx"
        style="margin-top: 15px"
      >
        <ElIcon class="el-icon--upload"><Upload /></ElIcon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .docx 和 .xlsx 格式文件，文件大小不超过 10MB
          </div>
        </template>
      </ElUpload>
      <template #footer>
        <ElButton @click="uploadVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpload" :loading="uploading" :disabled="!selectedFile">
          上传
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="configTemplateDialogVisible"
      title="选择页面配置模板"
      width="600px"
    >
      <div class="config-template-list">
        <ElCard
          v-for="(template, index) in configTemplates"
          :key="index"
          class="config-template-card"
          @click="selectConfigTemplate(template)"
        >
          <template #header>
            <div class="template-header">
              <span class="template-name">{{ template.name }}</span>
              <ElButton type="primary" size="small" @click.stop="selectConfigTemplate(template)">
                选择
              </ElButton>
            </div>
          </template>
          <div class="template-config">
            <pre>{{ JSON.stringify(template.config, null, 2) }}</pre>
          </div>
        </ElCard>
      </div>
      <template #footer>
        <ElButton @click="configTemplateDialogVisible = false">取消</ElButton>
      </template>
    </ElDialog>

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

    <ElDialog v-model="fieldDialogVisible" :title="fieldDialogTitle" width="800px">
      <ElForm :model="fieldForm" :rules="fieldFormRules" label-width="120px">
        <ElFormItem label="分组名称" prop="groupName">
          <ElSelect v-model="fieldForm.groupName" placeholder="选择字段分组" style="width: 200px">
            <ElOption
              v-for="group in fieldGroups"
              :key="group"
              :label="group"
              :value="group"
            />
          </ElSelect>
          <div class="form-tip">字段所属的分组，用于在字段选择器中分类显示</div>
        </ElFormItem>

        <ElFormItem label="字段名称" prop="label">
          <ElInput v-model="fieldForm.label" placeholder="请输入字段的中文名称" />
          <div class="form-tip">字段的显示名称，用于在界面上标识此字段</div>
        </ElFormItem>

        <ElFormItem label="字段值" prop="value">
          <ElInput v-model="fieldForm.value" placeholder="请输入字段的英文标识" />
          <div class="form-tip">
            字段的唯一标识符，使用驼峰命名法（如 contactPhone）<br>
            注意：创建后不可修改，同一分组下应保持唯一
          </div>
        </ElFormItem>

        <ElFormItem label="排序" prop="sortOrder">
          <ElInputNumber v-model="fieldForm.sortOrder" :min="1" :max="999" style="width: 100px" />
          <div class="form-tip">控制字段在分组中的显示顺序，数值越小显示越靠前</div>
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput v-model="fieldForm.description" type="textarea" :rows="3" placeholder="请输入字段的详细描述" />
          <div class="form-tip">字段的详细说明，帮助用户了解此字段的用途</div>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="fieldDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveField">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="previewVisible"
      title="文档模板预览"
      width="95%"
      top="2vh"
      :close-on-click-modal="false"
      :fullscreen="false"
    >
      <div class="preview-content" v-if="currentTemplate">
        <div class="preview-header">
          <h3>{{ currentTemplate.templateName }}</h3>
          <p class="template-info">
            模板编码: {{ currentTemplate.templateCode }} | 
            类型: {{ currentTemplate.templateType === 'WORD' ? 'Word文档' : 'Excel表格' }} | 
            更新时间: {{ formatDate(currentTemplate.updateTime) }}
          </p>
        </div>
        
        <div class="preview-mode-switch" v-if="currentTemplate.templateType === 'WORD'">
          <ElTag type="info" size="small">PDF预览</ElTag>
        </div>
        
        <div class="preview-body">
          <div v-if="previewLoading" class="preview-loading">
            <ElIcon class="loading-icon"><Loading /></ElIcon>
            <span>正在加载预览...</span>
          </div>
          <div v-else-if="previewError" class="preview-error">
            <ElIcon class="error-icon"><CircleClose /></ElIcon>
            <span>{{ previewError }}</span>
          </div>
          <div v-else-if="previewUrl" class="preview-container">
            <iframe :src="previewUrl" class="preview-iframe" frameborder="0"></iframe>
          </div>
          <div v-else class="preview-empty">
            <ElIcon class="empty-icon"><Document /></ElIcon>
            <span>暂无预览内容</span>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="previewVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="downloadPreviewFile" v-if="previewUrl">下载文件</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="templateFieldDialogVisible"
      title="编辑字段"
      width="600px"
    >
      <ElForm :model="templateFieldForm" label-width="120px">
        <ElFormItem label="字段名称">
          <ElInput v-model="templateFieldForm.fieldName" placeholder="请输入字段名称" />
        </ElFormItem>
        <ElFormItem label="字段标签">
          <ElInput v-model="templateFieldForm.fieldLabel" placeholder="请输入字段标签" />
        </ElFormItem>
        <ElFormItem label="字段类型">
          <ElSelect v-model="templateFieldForm.fieldType" placeholder="请选择字段类型">
            <ElOption label="文本" value="TEXT" />
            <ElOption label="数字" value="NUMBER" />
            <ElOption label="日期" value="DATE" />
            <ElOption label="列表" value="LIST" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="格式模式">
          <ElInput v-model="templateFieldForm.formatPattern" placeholder="例如：#,##0.00" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="templateFieldDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveTemplateField">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="placeholderDialogVisible"
      title="插入占位符"
      width="500px"
    >
      <div class="placeholder-dialog">
        <p>请选择要插入的字段：</p>
        <ElSelect v-model="selectedPlaceholderField" placeholder="选择字段" style="width: 100%; margin: 20px 0;">
          <ElOption
              v-for="field in templateMakerForm.fields"
              :key="field.fieldName"
              :label="`${field.fieldLabel} (${field.fieldName})`"
              :value="field.fieldName"
            />
        </ElSelect>
        <div class="placeholder-preview">
          <p>插入后将显示为：</p>
          <ElTag type="info" v-if="selectedPlaceholderField">
            <span v-html="'{{' + selectedPlaceholderField + '}}'"></span>
          </ElTag>
          <p v-else class="placeholder-hint">请先选择字段</p>
        </div>
      </div>
      <template #footer>
        <ElButton @click="placeholderDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmInsertPlaceholder">插入</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSwitch,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadioButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElAlert,
  ElUpload,
  ElTabs,
  ElTabPane,
  ElSelect,
  ElOption,
  ElOptionGroup,
  ElInputNumber,
  ElPagination,
  ElDivider,
  ElResult,
} from 'element-plus';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import {
  Plus,
  Document,
  Grid,
  ArrowDown,
  Upload,
  View,
  Download,
  UploadFilled,
  Search,
  Delete,
  Loading,
  CircleClose,
} from '@element-plus/icons-vue';
import type { FormInstance, UploadFile, UploadInstance } from 'element-plus';
import DocumentFormDesigner from '#/components/DocumentFormDesigner.vue';
import {
  documentTemplatesApi,
  type DocumentTemplate,
  type TemplateType,
  type ExportHistory,
} from '#/api/core/document-templates';
import { excelTemplatesApi } from '#/api/core/excel-templates';
import * as mammoth from 'mammoth';

const activeTab = ref('template-management');
const loading = ref(false);
const saving = ref(false);
const exporting = ref(false);
const uploading = ref(false);
const importLoading = ref(false);
const historyLoading = ref(false);
const templates = ref<DocumentTemplate[]>([]);
const exportHistory = ref<ExportHistory[]>([]);
const filterType = ref<TemplateType | ''>('');
const stats = computed(() => ({
  total: templates.value.length,
  word: templates.value.filter(t => t.templateType === 'WORD').length,
  excel: templates.value.filter(t => t.templateType === 'EXCEL').length,
  default: templates.value.filter(t => t.isDefault).length,
}));
const filteredTemplates = computed(() => {
  if (!filterType.value) return templates.value;
  return templates.value.filter(t => t.templateType === filterType.value);
});
const currentTemplate = ref<DocumentTemplate | null>(null);
const selectedTemplateForDesign = ref<DocumentTemplate | null>(null);
const dialogVisible = ref(false);
const designerVisible = ref(false);
const exportVisible = ref(false);
const uploadVisible = ref(false);
const historyVisible = ref(false);
const configTemplateDialogVisible = ref(false);
const importResultVisible = ref(false);
const fieldDialogVisible = ref(false);
const dialogTitle = ref('新建模板');
const fieldDialogTitle = ref('新建系统字段');
const formRef = ref<FormInstance>();
const designerRef = ref<InstanceType<typeof DocumentFormDesigner> | null>(null);
const uploadRef = ref<UploadInstance>();
const templateForm = ref({
  id: undefined as number | undefined,
  templateName: '',
  templateCode: '',
  templateType: 'WORD' as TemplateType,
  description: '',
  configJson: '',
  isDefault: false,
  mappings: [] as { excelHeader: string; targetField: string }[],
});
const exportForm = ref({
  fileName: '',
  dataJson: '',
});
const exportFormat = ref<'word' | 'pdf'>('word');
const templateFields = ref<Array<{
  key: string;
  label: string;
  required: boolean;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'LIST' | 'IMAGE' | 'TABLE';
  formatPattern?: string;
  imageType?: string;
}>>([]);
const fieldValues = ref<Record<string, any>>({});
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewError = ref('');
const previewUrl = ref('');
const previewMode = ref<'word' | 'pdf'>('pdf');
const previewBlob = ref<Blob | null>(null);
const selectedTemplateForMaker = ref<DocumentTemplate | null>(null);
const currentTemplateForMaker = ref<DocumentTemplate | null>(null);
const templateMakerForm = ref({
  templateName: '',
  templateCode: '',
  description: '',
  content: '',
  fields: [],
});
const editor = ref(null);
const toolbarConfig = ref({
  excludeKeys: [
    'fullScreen',
    'insertVideo',
  ],
});
const editorConfig = ref({
  placeholder: '请输入模板内容，可插入 {{fieldName}} 格式的占位符',
});
const onEditorCreated = (editorInstance) => {
  editor.value = editorInstance;
};
const onEditorChange = (editorInstance) => {
  templateMakerForm.value.content = editorInstance.getHtml();
};
const templateFieldDialogVisible = ref(false);
const currentTemplateField = ref<{
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  formatPattern?: string;
} | null>(null);
const templateFieldForm = ref({
  fieldName: '',
  fieldLabel: '',
  fieldType: 'TEXT',
  formatPattern: '',
});
const placeholderDialogVisible = ref(false);
const selectedPlaceholderField = ref('');
const selectedFile = ref<File | null>(null);
const configTemplates = ref([
  {
    name: '标准A4文档',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '窄边距A4文档',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 1.91,
        bottom: 1.91,
        left: 1.91,
        right: 1.91
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '横向A4文档',
    config: {
      layout: 'A4',
      orientation: 'landscape',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: 'A3文档',
    config: {
      layout: 'A3',
      orientation: 'portrait',
      margins: {
        top: 2.54,
        bottom: 2.54,
        left: 3.17,
        right: 3.17
      },
      font: {
        name: 'SimSun',
        size: 12
      }
    }
  },
  {
    name: '法律文书模板',
    config: {
      layout: 'A4',
      orientation: 'portrait',
      margins: {
        top: 3.81,
        bottom: 2.54,
        left: 3.81,
        right: 2.54
      },
      font: {
        name: 'SimSun',
        size: 14
      }
    }
  }
]);
const formRules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { max: 100, message: '模板名称最多100个字符', trigger: 'blur' },
  ],
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    { max: 50, message: '模板编码最多50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '模板编码只能包含字母、数字、下划线', trigger: 'blur' },
  ],
  templateType: [
    { required: true, message: '请选择模板类型', trigger: 'change' },
  ],
};
const selectedTemplateForDownload = ref('');
const selectedTemplateForImport = ref('');
const selectedTemplateForExport = ref('');
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
const systemFieldGroups = ref<Array<{
  group: string;
  fields: Array<{
    label: string;
    value: string;
    sortOrder: number;
    description?: string;
  }>;
}>>([]);
const fieldNameMapping = ref<Record<string, string>>({});
const fieldSearchLoadingState = {
  value: [] as boolean[]
};
const fieldSelectorFieldGroupsState = {
  value: [] as Array<Array<{
    group: string;
    fields: Array<{
      label: string;
      value: string;
      sortOrder: number;
      description?: string;
    }>;
  }>>
};
const fieldSearchLoadingValue = computed(() => Array.isArray(fieldSearchLoadingState.value) ? fieldSearchLoadingState.value : []);
const fieldSelectorFieldGroupsValue = computed(() => Array.isArray(fieldSelectorFieldGroupsState.value) ? fieldSelectorFieldGroupsState.value : []);
const systemFieldsList = ref<Array<{
  id: number;
  groupName: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}>>([]);
const fieldForm = ref({
  id: undefined as number | undefined,
  groupName: '',
  label: '',
  value: '',
  sortOrder: 1,
  description: ''
});
const fieldFormRules = {
  groupName: [
    { required: true, message: '请选择分组名称', trigger: 'blur' }
  ],
  label: [
    { required: true, message: '请输入字段名称', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字段值', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9]*$/, message: '字段值只能包含字母和数字，且以字母开头', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', message: '排序值必须是数字', trigger: 'blur' }
  ]
};
const fieldGroups = ref<string[]>(['基本信息', '债权信息', '联系人信息', '银行信息', '其他信息']);
const fieldSearchQuery = ref('');
const selectedGroup = ref('');
const filteredSystemFields = ref<Array<{
  id: number;
  groupName: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}>>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const pagedSystemFields = ref<Array<{
  id: number;
  groupName: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}>>([]);
const availableGroups = ref<string[]>([]);
const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await documentTemplatesApi.getTemplates();
    if (response.code === 200) {
      templates.value = response.data;
    }
  } catch (error) {
    ElMessage.error('加载模板列表失败');
  } finally {
    loading.value = false;
  }
};
const handleFilterChange = () => {};
const showCreateDialog = () => {
  dialogTitle.value = '新建模板';
  templateForm.value = {
    id: undefined,
    templateName: '',
    templateCode: '',
    templateType: 'WORD',
    description: '',
    configJson: '',
    isDefault: false,
    mappings: [],
  };
  dialogVisible.value = true;
};
const showEditDialog = async (template: DocumentTemplate) => {
  dialogTitle.value = '编辑模板';
  templateForm.value = {
    id: template.id,
    templateName: template.templateName,
    templateCode: template.templateCode,
    templateType: template.templateType,
    description: template.description || '',
    configJson: template.configJson || '',
    isDefault: template.isDefault,
    mappings: [],
  };
  if (template.templateType === 'EXCEL') {
    try {
      const response = await documentTemplatesApi.getTemplateDetail(template.id);
      if (response.code === 200 && response.data) {
        const templateDetail = response.data;
        if (templateDetail.mappings && Array.isArray(templateDetail.mappings)) {
          templateForm.value.mappings = templateDetail.mappings;
        }
      }
    } catch (error) {
      console.error('获取模板详情失败:', error);
    }
  }
  dialogVisible.value = true;
};
const showConfigTemplateDialog = () => {
  configTemplateDialogVisible.value = true;
};
const selectConfigTemplate = (template: any) => {
  templateForm.value.configJson = JSON.stringify(template.config, null, 2);
  configTemplateDialogVisible.value = false;
  ElMessage.success(`已选择模板: ${template.name}`);
};
const saveTemplate = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      let response;
      const data = {
        templateName: templateForm.value.templateName,
        templateCode: templateForm.value.templateCode,
        templateType: templateForm.value.templateType,
        description: templateForm.value.description,
        configJson: templateForm.value.configJson,
        isDefault: templateForm.value.isDefault,
        mappings: templateForm.value.mappings || [],
      };
      if (templateForm.value.id) {
        response = await documentTemplatesApi.updateTemplate(templateForm.value.id, {
          ...data,
          id: templateForm.value.id,
        });
      } else {
        response = await documentTemplatesApi.createTemplate(data);
      }
      if (response.code === 200) {
        ElMessage.success(templateForm.value.id ? '更新成功' : '创建成功');
        dialogVisible.value = false;
        loadTemplates();
      } else {
        ElMessage.error(response.message || '操作失败');
      }
    } catch (error) {
      ElMessage.error('操作失败');
    } finally {
      saving.value = false;
    }
  });
};
const showDesignDialog = async (template: DocumentTemplate) => {
  currentTemplate.value = template;
  designerVisible.value = true;
  try {
    const response = await documentTemplatesApi.getTemplateDetail(template.id);
    if (response.code === 200 && designerRef.value) {
      const templateDetail = response.data;
      currentTemplate.value = templateDetail;
      if (templateDetail.fields) {
        designerRef.value.setTemplateFields(templateDetail.fields, templateDetail.templateType);
      }
    }
  } catch (error) {
    console.error('加载模板详情失败:', error);
  }
};
const getFieldTypeLabel = (fieldType: string) => {
  const typeMap: Record<string, string> = {
    TEXT: '文本',
    NUMBER: '数字',
    DATE: '日期',
    LIST: '列表',
    IMAGE: '图片',
    TABLE: '表格',
  };
  return typeMap[fieldType] || '文本';
};
const getListOptions = (formatPattern?: string) => {
  if (!formatPattern) return [];
  try {
    const options = formatPattern.split(',').map(item => item.trim()).filter(Boolean);
    return options.map(opt => ({ label: opt, value: opt }));
  } catch {
    return [];
  }
};
const handleFieldImageUpload = async (fieldKey: string, file: File, imageType?: string) => {
  if (!currentTemplate.value) {
    ElMessage.error('请先选择模板');
    return false;
  }
  try {
    const finalImageType = imageType || 
                           fieldKey.includes('签名') ? 'signature' : 
                           fieldKey.includes('印章') ? 'seal' : 
                           fieldKey.includes('盖章') ? 'seal' : 'image';
    const response = await documentTemplatesApi.uploadTemplateImage(
      currentTemplate.value.id,
      file,
      finalImageType
    );
    if (response.code === 200 && response.data) {
      fieldValues.value[fieldKey] = response.data.filePath;
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error(response.message || '图片上传失败');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败');
  }
  return false;
};
const showFormDesignerDialog = () => {
  if (!selectedTemplateForDesign.value) {
    ElMessage.warning('请先选择要设计的模板');
    return;
  }
  showDesignDialog(selectedTemplateForDesign.value);
};
const saveDesignerConfig = async () => {
  if (!designerRef.value || !currentTemplate.value) return;
  saving.value = true;
  try {
    const fields = designerRef.value.getTemplateFields();
    const response = await documentTemplatesApi.updateTemplate(currentTemplate.value.id, {
      id: currentTemplate.value.id,
      fields,
    });
    if (response.code === 200) {
      ElMessage.success('字段配置保存成功');
      designerVisible.value = false;
      loadTemplates();
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};
const showExportDialog = async (template: DocumentTemplate) => {
  currentTemplate.value = template;
  exportForm.value = {
    fileName: template.templateName,
    dataJson: '',
  };
  try {
    const response = await documentTemplatesApi.getTemplateDetail(template.id);
    if (response.code === 200) {
      const templateDetail = response.data;
      currentTemplate.value = templateDetail;
      const fields = templateDetail.fields || [];
      templateFields.value = fields.map((field: any) => ({
        key: field.fieldName,
        label: field.fieldLabel || field.fieldName,
        required: field.isRequired || false,
        fieldType: field.fieldType || 'TEXT',
        formatPattern: field.formatPattern,
        imageType: field.fieldName.includes('签名') ? 'signature' : 
                   field.fieldName.includes('印章') ? 'seal' : 
                   field.fieldName.includes('盖章') ? 'seal' : 'image'
      }));
      fieldValues.value = {};
      fields.forEach((field: any) => {
        fieldValues.value[field.fieldName] = field.defaultValue || '';
      });
    }
  } catch (error) {
    console.error('加载模板详情失败:', error);
    templateFields.value = [];
    fieldValues.value = {};
  }
  exportVisible.value = true;
};
const showPreviewDialog = async (template: DocumentTemplate) => {
  currentTemplate.value = template;
  previewVisible.value = true;
  previewLoading.value = true;
  previewError.value = '';
  previewUrl.value = '';
  previewBlob.value = null;
  previewMode.value = 'pdf';
  await loadPreviewContent();
};
const loadPreviewContent = async () => {
  if (!currentTemplate.value) return;
  previewLoading.value = true;
  previewError.value = '';
  try {
    let blob: Blob;
    if (previewMode.value === 'pdf') {
      console.log('开始PDF预览，模板ID:', currentTemplate.value.id);
      blob = await documentTemplatesApi.previewPdf(currentTemplate.value.id);
    } else {
      console.log('开始Word预览，模板ID:', currentTemplate.value.id);
      blob = await documentTemplatesApi.previewTemplate(currentTemplate.value.id);
    }
    console.log('预览接口返回Blob数据:', blob);
    console.log('Blob类型:', blob.type);
    console.log('Blob大小:', blob.size);
    if (blob && blob.size > 0) {
      previewBlob.value = blob;
      if (previewMode.value === 'pdf') {
        previewUrl.value = URL.createObjectURL(blob);
      } else {
        const wordBlobUrl = URL.createObjectURL(blob);
        const simpleHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Word文档预览</title>
</head>
<body>
<h1>Word文档预览</h1>
<p>模板编码: ${currentTemplate.value.templateCode}</p>
<a href="${wordBlobUrl}" target="_blank">下载Word文档</a>
</body>
</html>
        `;
        const htmlBlob = new Blob([simpleHtml], { type: 'text/html' });
        previewUrl.value = URL.createObjectURL(htmlBlob);
      }
    } else {
      previewError.value = '预览数据为空';
    }
  } catch (error: any) {
    console.error('预览模板失败:', error);
    previewError.value = '预览失败: ' + (error.message || '未知错误');
  } finally {
    previewLoading.value = false;
  }
};
const downloadPreviewFile = () => {
  if (!previewBlob.value || !currentTemplate.value) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(previewBlob.value);
  const ext = previewMode.value === 'pdf' ? 'pdf' : 'docx';
  link.download = `${currentTemplate.value.templateName}.${ext}`;
  link.click();
  URL.revokeObjectURL(link.href);
};
const loadTemplateForMaker = async () => {
  if (!selectedTemplateForMaker.value) {
    currentTemplateForMaker.value = null;
    resetTemplateMaker();
    return;
  }
  try {
    const response = await documentTemplatesApi.getTemplateDetail(selectedTemplateForMaker.value.id);
    if (response.code === 200) {
      const templateDetail = response.data;
      currentTemplateForMaker.value = templateDetail;
      const fields = templateDetail.fields || [];
      templateMakerForm.value = {
        templateName: templateDetail.templateName,
        templateCode: templateDetail.templateCode,
        description: templateDetail.description || '',
        content: templateDetail.configJson ? JSON.parse(templateDetail.configJson).content || '' : '',
        fields: fields.map((field: any) => ({
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          formatPattern: field.formatPattern
        })),
      };
    }
  } catch (error) {
    console.error('加载模板详情失败:', error);
    ElMessage.error('加载模板详情失败');
  }
};
const createNewTemplate = () => {
  selectedTemplateForMaker.value = null;
  currentTemplateForMaker.value = {
    id: 0,
    templateName: '',
    templateCode: 'TEMPLATE_' + Date.now(),
    templateType: 'WORD',
    description: '',
    isDefault: false,
    status: 'ACTIVE',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  };
  templateMakerForm.value = {
    templateName: '',
    templateCode: 'TEMPLATE_' + Date.now(),
    description: '',
    content: '',
    fields: [],
  };
};
const addField = () => {
  templateFieldForm.value = {
    fieldName: 'field_' + Date.now(),
    fieldLabel: '新字段',
    fieldType: 'TEXT',
    formatPattern: '',
  };
  currentTemplateField.value = null;
  templateFieldDialogVisible.value = true;
};
const editField = (field: any) => {
  templateFieldForm.value = {
    fieldName: field.fieldName,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    formatPattern: field.formatPattern || '',
  };
  currentTemplateField.value = field;
  templateFieldDialogVisible.value = true;
};
const removeField = (index: number) => {
  templateMakerForm.value.fields.splice(index, 1);
  ElMessage.success('字段删除成功');
};
const saveTemplateField = () => {
  if (!templateFieldForm.value.fieldName || !templateFieldForm.value.fieldLabel) {
    ElMessage.warning('请填写字段名称和标签');
    return;
  }
  if (currentTemplateField.value) {
    const index = templateMakerForm.value.fields.findIndex(f => f.fieldName === currentTemplateField.value.fieldName);
    if (index !== -1) {
      templateMakerForm.value.fields[index] = {
        fieldName: templateFieldForm.value.fieldName,
        fieldLabel: templateFieldForm.value.fieldLabel,
        fieldType: templateFieldForm.value.fieldType,
        formatPattern: templateFieldForm.value.formatPattern,
      };
    }
  } else {
    templateMakerForm.value.fields.push({
      fieldName: templateFieldForm.value.fieldName,
      fieldLabel: templateFieldForm.value.fieldLabel,
      fieldType: templateFieldForm.value.fieldType,
      formatPattern: templateFieldForm.value.formatPattern,
    });
  }
  templateFieldDialogVisible.value = false;
  ElMessage.success('字段保存成功');
};
const insertPlaceholder = () => {
  if (templateMakerForm.value.fields.length === 0) {
    ElMessage.warning('请先添加字段');
    return;
  }
  placeholderDialogVisible.value = true;
};
const confirmInsertPlaceholder = () => {
  if (!selectedPlaceholderField.value) {
    ElMessage.warning('请选择字段');
    return;
  }
  const placeholder = `{{${selectedPlaceholderField.value}}}`;
  templateMakerForm.value.content += placeholder;
  placeholderDialogVisible.value = false;
  ElMessage.success('占位符插入成功');
};
const previewTemplateContent = () => {
  if (!templateMakerForm.value.content) {
    ElMessage.warning('模板内容为空');
    return;
  }
  let previewContent = templateMakerForm.value.content;
  templateMakerForm.value.fields.forEach(field => {
    let exampleValue = '';
    switch (field.fieldType) {
      case 'TEXT':
        exampleValue = '示例文本';
        break;
      case 'NUMBER':
        exampleValue = '1,234.56';
        break;
      case 'DATE':
        exampleValue = new Date().toLocaleDateString();
        break;
      default:
        exampleValue = '示例值';
    }
    previewContent = previewContent.replace(new RegExp(`{{${field.fieldName}}}`, 'g'), exampleValue);
  });
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    const sanitizedContent = sanitizeHtml(previewContent);
    previewWindow.document.write(`
      <html>
        <head>
          <title>模板预览</title>
        </head>
        <body>
          <h1>模板预览</h1>
          <div>${sanitizedContent}</div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  }
};
const saveTemplateMaker = async () => {
  if (!templateMakerForm.value.templateName || !templateMakerForm.value.templateCode) {
    ElMessage.warning('请填写模板名称和编码');
    return;
  }
  const templateConfig = {
    templateName: templateMakerForm.value.templateName,
    templateCode: templateMakerForm.value.templateCode,
    templateType: 'WORD',
    description: templateMakerForm.value.description,
    content: templateMakerForm.value.content,
    fields: templateMakerForm.value.fields,
  };
  try {
    const data = {
      templateName: templateConfig.templateName,
      templateCode: templateConfig.templateCode,
      templateType: 'WORD' as TemplateType,
      description: templateConfig.description,
      configJson: JSON.stringify(templateConfig),
      fields: templateConfig.fields.map(field => ({
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType as any,
        sourceField: field.fieldName,
        sortOrder: templateConfig.fields.indexOf(field) + 1,
        isRequired: false,
        formatPattern: field.formatPattern,
      })),
    };
    let response;
    if (currentTemplateForMaker.value) {
      response = await documentTemplatesApi.updateTemplate(currentTemplateForMaker.value.id, {
        id: currentTemplateForMaker.value.id,
        ...data,
      });
    } else {
      response = await documentTemplatesApi.createTemplate(data);
    }
    if (response.code === 200) {
      ElMessage.success(currentTemplateForMaker.value ? '模板更新成功' : '模板创建成功');
      await loadTemplates();
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    console.error('保存模板失败:', error);
    ElMessage.error('保存模板失败');
  }
};
const resetTemplateMaker = () => {
  templateMakerForm.value = {
    templateName: '',
    templateCode: 'TEMPLATE_' + Date.now(),
    description: '',
    content: '',
    fields: [],
  };
};
const handleTemplateExport = async () => {
  if (!currentTemplate.value) return;
  exporting.value = true;
  try {
    const requestData = {
      fileName: exportForm.value.fileName,
      data: fieldValues.value,
    };
    let response;
    let fileExt = 'docx';
    if (currentTemplate.value.templateType === 'WORD') {
      if (exportFormat.value === 'pdf') {
        response = await documentTemplatesApi.exportPdf(currentTemplate.value.id, requestData);
        fileExt = 'pdf';
      } else {
        response = await documentTemplatesApi.exportWord(currentTemplate.value.id, requestData);
        fileExt = 'docx';
      }
    } else {
      response = await documentTemplatesApi.exportExcel(currentTemplate.value.id, requestData);
      fileExt = 'xlsx';
    }
    let blob;
    if (response && response.data instanceof Blob) {
      blob = response.data;
    } else if (response instanceof Blob) {
      blob = response;
    } else {
      ElMessage.error('导出失败：无法获取有效的文件数据');
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportForm.value.fileName}.${fileExt}`;
    link.click();
    URL.revokeObjectURL(link.href);
    ElMessage.success('导出成功');
    exportVisible.value = false;
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};
const getFileNameFromPath = (filePath: string | undefined) => {
  if (!filePath) return '';
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || filePath;
};
const handleCommand = async (command: string, template: DocumentTemplate) => {
  currentTemplate.value = template;
  switch (command) {
    case 'upload':
      try {
        const response = await documentTemplatesApi.getTemplateDetail(template.id);
        if (response.code === 200) {
          currentTemplate.value = response.data;
        }
      } catch (error) {
        console.error('加载模板详情失败:', error);
      }
      selectedFile.value = null;
      uploadVisible.value = true;
      break;
    case 'setDefault':
      await handleSetDefault(template);
      break;
    case 'history':
      await loadExportHistory(template.id);
      historyVisible.value = true;
      break;
    case 'delete':
      await handleDelete(template);
      break;
  }
};
const handleSetDefault = async (template: DocumentTemplate) => {
  try {
    const response = await documentTemplatesApi.setDefaultTemplate(
      template.id,
      template.templateType,
    );
    if (response.code === 200) {
      ElMessage.success('设置默认模板成功');
      loadTemplates();
    } else {
      ElMessage.error(response.message || '设置失败');
    }
  } catch (error) {
    ElMessage.error('设置失败');
  }
};
const handleDelete = async (template: DocumentTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.templateName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    const response = await documentTemplatesApi.deleteTemplate(template.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadTemplates();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};
const handleStatusChange = async (template: DocumentTemplate, status: string) => {
  try {
    const response = await documentTemplatesApi.updateTemplate(template.id, {
      id: template.id,
      status: status as 'ACTIVE' | 'INACTIVE',
    });
    if (response.code === 200) {
      ElMessage.success('状态更新成功');
    } else {
      ElMessage.error(response.message || '更新失败');
      template.status = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }
  } catch (error) {
    ElMessage.error('更新失败');
    template.status = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }
};
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
  }
};
const handleFileRemove = () => {
  selectedFile.value = null;
};
const handleUpload = async () => {
  if (!selectedFile.value || !currentTemplate.value) return;
  uploading.value = true;
  try {
    const response = await documentTemplatesApi.uploadTemplateFile(
      currentTemplate.value.id,
      selectedFile.value,
    );
    if (response.code === 200) {
      ElMessage.success('文件上传成功');
      uploadVisible.value = false;
      loadTemplates();
    } else {
      ElMessage.error(response.message || '上传失败');
    }
  } catch (error) {
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
};
const loadExportHistory = async (templateId: number) => {
  historyLoading.value = true;
  try {
    const response = await documentTemplatesApi.getTemplateExportHistory(templateId);
    if (response.code === 200) {
      exportHistory.value = response.data;
    }
  } catch (error) {
    ElMessage.error('加载导出历史失败');
  } finally {
    historyLoading.value = false;
  }
};
const handleDownloadTemplate = async () => {
  try {
    const response = await excelTemplatesApi.downloadTemplate(
      selectedTemplateForDownload.value || undefined
    );
    const blob = new Blob([response as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const templateName = selectedTemplateForDownload.value
      ? templates.value.find(t => t.templateCode === selectedTemplateForDownload.value)?.templateName || 'template'
      : 'default_template';
    link.download = `${templateName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败');
  }
};
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择Excel文件');
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
      selectedFile.value = null;
      uploadRef.value?.clearFiles();
      if (response.data.failCount === 0) {
        ElMessage.success(`成功导入 ${response.data.successCount} 条数据`);
      } else {
        ElMessage.warning(`导入完成，成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`);
      }
    } else {
      ElMessage.error(response.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败，请检查文件格式');
  } finally {
    importLoading.value = false;
  }
};
const handleExport = async () => {
  if (!selectedTemplateForExport.value) {
    ElMessage.warning('请先选择导出模板');
    return;
  }
  try {
    const response = await excelTemplatesApi.exportData(
      selectedTemplateForExport.value,
      caseIdForExport.value || undefined,
      registrationStatusForExport.value || undefined
    );
    const blob = new Blob([response as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const templateName = templates.value.find(t => t.templateCode === selectedTemplateForExport.value)?.templateCode || 'export';
    link.download = `${templateName}_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败');
  }
};
const loadSystemFields = async () => {
  try {
    const response = await excelTemplatesApi.getSystemFields();
    if (response.code === 200) {
      const data = Array.isArray(response.data) ? response.data : [];
      systemFieldGroups.value = data;
      const mapping: Record<string, string> = {};
      data.forEach((group) => {
        group.fields.forEach((field) => {
          const chineseName = field.label.replace(/\s*\([^)]*\)\s*$/, '').trim();
          mapping[field.value] = chineseName;
        });
      });
      fieldNameMapping.value = mapping;
    } else {
      ElMessage.error('加载系统字段失败: ' + response.message);
    }
  } catch (error: any) {
    ElMessage.error('加载系统字段失败: ' + (error.message || '未知错误'));
  }
};
const loadSystemFieldsList = async () => {
  try {
    const response = await excelTemplatesApi.getSystemFields();
    if (response.code === 200) {
      const fields: Array<{
        id: number;
        groupName: string;
        label: string;
        value: string;
        sortOrder: number;
        description?: string;
      }> = [];
      response.data.forEach((group) => {
        group.fields.forEach((field) => {
          fields.push({
            id: field.id,
            groupName: field.groupName || group.group,
            label: field.label,
            value: field.value,
            sortOrder: field.sortOrder,
            description: field.description
          });
        });
      });
      systemFieldsList.value = fields;
      filteredSystemFields.value = fields;
      extractAvailableGroups();
      calculatePagedFields();
    } else {
      ElMessage.error('加载系统字段列表失败: ' + response.message);
    }
  } catch (error: any) {
    ElMessage.error('加载系统字段列表失败: ' + (error.message || '未知错误'));
  }
};
const extractAvailableGroups = () => {
  const groups = new Set<string>();
  systemFieldsList.value.forEach(field => {
    groups.add(field.groupName);
  });
  availableGroups.value = Array.from(groups).sort();
};
const calculatePagedFields = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  pagedSystemFields.value = filteredSystemFields.value.slice(startIndex, endIndex);
};
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  calculatePagedFields();
};
const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  calculatePagedFields();
};
const handleSystemFieldSearch = () => {
  applyFilters();
};
const handleGroupChange = () => {
  applyFilters();
};
const applyFilters = () => {
  let filtered = systemFieldsList.value;
  if (selectedGroup.value) {
    filtered = filtered.filter(field => field.groupName === selectedGroup.value);
  }
  if (fieldSearchQuery.value) {
    const query = fieldSearchQuery.value.toLowerCase();
    filtered = filtered.filter(field => 
      field.label.toLowerCase().includes(query) ||
      field.value.toLowerCase().includes(query) ||
      field.groupName.toLowerCase().includes(query)
    );
  }
  filteredSystemFields.value = filtered;
  currentPage.value = 1;
  calculatePagedFields();
};
const onFieldSelect = (index: number, fieldValue: string) => {
  const mapping = templateForm.value.mappings[index];
  if (mapping && fieldValue) {
    mapping.excelHeader = fieldNameMapping.value[fieldValue] || fieldValue;
  }
};
const addMapping = () => {
  templateForm.value.mappings.push({
    excelHeader: '',
    targetField: ''
  });
  const newIndex = templateForm.value.mappings.length - 1;
  const getSafeArray = <T>(arr: any, defaultValue: T[]): T[] => {
    if (!Array.isArray(arr)) {
      return defaultValue;
    }
    return arr;
  };
  let safeSearchLoading = getSafeArray(fieldSearchLoadingState.value, []);
  while (safeSearchLoading.length <= newIndex) {
    safeSearchLoading.push(false);
  }
  safeSearchLoading[newIndex] = false;
  fieldSearchLoadingState.value = safeSearchLoading;
  let safeFieldGroups = getSafeArray(fieldSelectorFieldGroupsState.value, []);
  while (safeFieldGroups.length <= newIndex) {
    safeFieldGroups.push([]);
  }
  const systemGroups = getSafeArray(systemFieldGroups.value, []);
  safeFieldGroups[newIndex] = systemGroups;
  fieldSelectorFieldGroupsState.value = safeFieldGroups;
};
const removeMapping = (index: number) => {
  templateForm.value.mappings.splice(index, 1);
  const getSafeArray = <T>(arr: any, defaultValue: T[]): T[] => {
    if (!Array.isArray(arr)) {
      return defaultValue;
    }
    return arr;
  };
  let safeSearchLoading = getSafeArray(fieldSearchLoadingState.value, []);
  if (safeSearchLoading.length > index) {
    safeSearchLoading.splice(index, 1);
    fieldSearchLoadingState.value = safeSearchLoading;
  }
  let safeFieldGroups = getSafeArray(fieldSelectorFieldGroupsState.value, []);
  if (safeFieldGroups.length > index) {
    safeFieldGroups.splice(index, 1);
    fieldSelectorFieldGroupsState.value = safeFieldGroups;
  }
};
const handleFieldSelectorSearch = (index: number, query: string) => {
  const getSafeArray = <T>(arr: any, defaultValue: T[]): T[] => {
    if (!Array.isArray(arr)) {
      return defaultValue;
    }
    return arr;
  };
  const fieldGroups = getSafeArray(systemFieldGroups.value, []);
  if (!query.trim()) {
    let safeFieldGroups = getSafeArray(fieldSelectorFieldGroupsState.value, []);
    while (safeFieldGroups.length <= index) {
      safeFieldGroups.push([]);
    }
    safeFieldGroups[index] = fieldGroups;
    fieldSelectorFieldGroupsState.value = safeFieldGroups;
    return;
  }
  let safeSearchLoading = getSafeArray(fieldSearchLoadingState.value, []);
  while (safeSearchLoading.length <= index) {
    safeSearchLoading.push(false);
  }
  safeSearchLoading[index] = true;
  fieldSearchLoadingState.value = safeSearchLoading;
  setTimeout(() => {
    const lowercaseQuery = query.toLowerCase();
    const filteredGroups = fieldGroups.map(group => {
      const filteredFields = group.fields.filter(field => {
        return field.label.toLowerCase().includes(lowercaseQuery) ||
               field.value.toLowerCase().includes(lowercaseQuery);
      });
      return {
        ...group,
        fields: filteredFields
      };
    }).filter(group => group.fields.length > 0);
    let safeFieldGroups = getSafeArray(fieldSelectorFieldGroupsState.value, []);
    while (safeFieldGroups.length <= index) {
      safeFieldGroups.push([]);
    }
    safeFieldGroups[index] = filteredGroups;
    fieldSelectorFieldGroupsState.value = safeFieldGroups;
    let safeSearchLoading = getSafeArray(fieldSearchLoadingState.value, []);
    while (safeSearchLoading.length <= index) {
      safeSearchLoading.push(false);
    }
    safeSearchLoading[index] = false;
    fieldSearchLoadingState.value = safeSearchLoading;
  }, 300);
};
const showCreateFieldDialog = () => {
  fieldDialogTitle.value = '新建系统字段';
  fieldForm.value = {
    id: undefined,
    groupName: '',
    label: '',
    value: '',
    sortOrder: 1,
    description: ''
  };
  fieldDialogVisible.value = true;
};
const showEditFieldDialog = (field: any) => {
  fieldDialogTitle.value = '编辑系统字段';
  fieldForm.value = {
    id: field.id,
    groupName: field.groupName,
    label: field.label,
    value: field.value,
    sortOrder: field.sortOrder,
    description: field.description
  };
  fieldDialogVisible.value = true;
};
const saveField = async () => {
  try {
    const request = {
      groupName: fieldForm.value.groupName,
      label: fieldForm.value.label,
      value: fieldForm.value.value,
      sortOrder: fieldForm.value.sortOrder,
      description: fieldForm.value.description
    };
    let response;
    if (fieldForm.value.id) {
      response = await excelTemplatesApi.updateSystemField(fieldForm.value.id, request);
    } else {
      response = await excelTemplatesApi.createSystemField(request);
    }
    if (response.code === 200) {
      ElMessage.success(fieldForm.value.id ? '更新成功' : '创建成功');
      fieldDialogVisible.value = false;
      await loadSystemFields();
      await loadSystemFieldsList();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('保存系统字段失败:', error);
    ElMessage.error('操作失败');
  }
};
const deleteField = async (field: any) => {
  try {
    const response = await excelTemplatesApi.deleteSystemField(field.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      await loadSystemFields();
      await loadSystemFieldsList();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('删除系统字段失败:', error);
    ElMessage.error('操作失败');
  }
};
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
onMounted(async () => {
  await loadTemplates();
  await loadSystemFields();
  await loadSystemFieldsList();
});
</script>

<style scoped>
.dynamic-fields {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f9fafc;
}
.field-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}
.field-label {
  width: 120px;
  font-weight: 500;
  color: #303133;
  margin-right: 15px;
  flex-shrink: 0;
}
.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}
.no-fields {
  margin-top: 10px;
}
.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
.mapping-section {
  margin-top: 15px;
}
.mapping-header {
  display: flex;
  margin-bottom: 10px;
  font-weight: 500;
  color: #303133;
}
.header-label {
  width: 220px;
  margin-right: 80px;
}
.header-label:last-child {
  width: auto;
  margin-right: 0;
}
.mapping-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.add-mapping-btn {
  margin-top: 10px;
}
.config-input-wrapper {
  display: flex;
  align-items: flex-start;
}
.config-input-wrapper .el-input {
  flex: 1;
  margin-right: 10px;
}
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  text-align: center;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}
.stat-label {
  color: #909399;
  font-size: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.operation-section {
  margin-bottom: 20px;
}
.section-desc {
  color: #909399;
  margin-bottom: 15px;
}
.import-options,
.export-options {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.tip-text {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}
.upload-inline {
  display: inline-block;
}
.config-template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}
.config-template-card {
  cursor: pointer;
  transition: all 0.3s;
}
.config-template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.template-config {
  margin-top: 10px;
  background-color: #f9fafc;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
.template-config pre {
  margin: 0;
  font-size: 12px;
  color: #606266;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.preview-content {
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.preview-header {
  padding: 15px 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.preview-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}
.template-info {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.preview-mode-switch {
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.upload-info {
  margin-bottom: 15px;
}
.current-file-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.current-file-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}
.file-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}
.file-icon {
  font-size: 32px;
  color: #409eff;
}
.file-meta {
  flex: 1;
}
.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}
.file-path {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  word-break: break-all;
}
.no-file-info {
  margin-top: 15px;
}
.image-upload-field {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.image-preview-small {
  width: 60px;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}
.image-preview-small img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.preview-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.preview-loading,
.preview-error,
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
.loading-icon,
.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}
.loading-icon {
  color: #409eff;
  animation: rotate 1s linear infinite;
}
.error-icon {
  color: #f56c6c;
}
.empty-icon {
  color: #909399;
}
.preview-container {
  height: 100%;
  overflow: hidden;
}
.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.template-maker-content {
  min-height: 600px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #c0c4cc;
}
.empty-state h3 {
  margin: 0 0 10px 0;
  color: #606266;
}
.empty-state p {
  margin: 0;
  color: #909399;
}
.template-info-form {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 4px;
}
.template-content-editor {
  margin-bottom: 30px;
}
.template-content-editor h4,
.template-fields h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}
.editor-toolbar {
  margin-bottom: 10px;
}
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.editor-container .el-textarea {
  border: none;
}
.editor-container .el-textarea__inner {
  border: none;
  resize: vertical;
  min-height: 300px;
  font-family: 'Courier New', Courier, monospace;
  line-height: 1.6;
}
.template-fields {
  margin-bottom: 30px;
}
.template-actions {
  display: flex;
  gap: 10px;
}
.placeholder-dialog {
  padding: 20px 0;
}
.placeholder-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9fafc;
  border-radius: 4px;
}
.placeholder-hint {
  color: #909399;
  font-style: italic;
}
@media (max-width: 768px) {
  .template-info-form {
    padding: 15px;
  }
  
  .editor-container .el-textarea__inner {
    min-height: 200px;
  }
}
</style>

===========================================================================
以上为原始模板管理页面完整代码，已注释保留，待功能恢复时启用
===========================================================================
-->
