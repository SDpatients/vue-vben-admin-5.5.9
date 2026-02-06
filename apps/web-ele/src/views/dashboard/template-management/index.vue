<template>
  <div class="template-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-title">
        <h2>模板管理</h2>
        <p class="subtitle">统一管理Word和Excel模板，支持表单设计、数据导入导出和系统字段管理</p>
      </div>
    </div>

    <!-- 标签页导航 -->
    <ElTabs v-model="activeTab" class="template-tabs">
      <!-- 模板管理标签页 -->
      <ElTabPane label="模板管理" name="template-management">
        <!-- 统计卡片 -->
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

        <!-- 模板列表 -->
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

      <!-- 表单设计标签页 -->
      <ElTabPane label="表单设计" name="form-design">
        <!-- 表单设计器卡片 -->
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

      <!-- 数据导入导出标签页 -->
      <ElTabPane label="数据导入导出" name="data-import-export">
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

      <!-- 系统字段管理标签页 -->
      <ElTabPane label="系统字段管理" name="system-fields">
        <!-- 系统字段管理卡片 -->
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

          <!-- 分页组件 -->
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

    <!-- 创建/编辑模板对话框 -->
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
        
        <!-- Excel模板字段映射 -->
        <ElFormItem label="字段映射" v-if="templateForm.templateType === 'EXCEL'">
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
                  :loading="fieldSearchLoading.value[index]"
                  @change="(value: string) => onFieldSelect(index, value)"
                >
                  <ElOptionGroup
                    v-for="group in (fieldSelectorFieldGroups.value[index] || systemFieldGroups.value)"
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
        <ElButton type="primary" @click="saveTemplate" :loading="saving">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 表单设计器对话框 -->
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

    <!-- 导出对话框 -->
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
        <ElFormItem label="导出数据">
          <ElInput
            v-model="exportForm.dataJson"
            type="textarea"
            :rows="8"
            placeholder='{"caseName": "某某公司破产清算案", "creditorName": "张三"}'
          />
          <div class="form-tip">JSON格式，对应模板字段的数据</div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="exportVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTemplateExport" :loading="exporting">
          导出
        </ElButton>
      </template>
    </ElDialog>

    <!-- 上传文件对话框 -->
    <ElDialog
      v-model="uploadVisible"
      title="上传模板文件"
      width="500px"
    >
      <ElUpload
        ref="uploadRef"
        drag
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        accept=".docx,.xlsx"
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

    <!-- 配置模板对话框 -->
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

    <!-- 创建/编辑系统字段对话框 -->
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
            <strong>注意：</strong>创建后不可修改，同一分组下应保持唯一
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

// 激活的标签页
const activeTab = ref('template-management');

// 加载状态
const loading = ref(false);
const saving = ref(false);
const exporting = ref(false);
const uploading = ref(false);
const importLoading = ref(false);
const historyLoading = ref(false);

// 数据列表
const templates = ref<DocumentTemplate[]>([]);
const exportHistory = ref<ExportHistory[]>([]);

// 筛选条件
const filterType = ref<TemplateType | ''>('');

// 统计
const stats = computed(() => ({
  total: templates.value.length,
  word: templates.value.filter(t => t.templateType === 'WORD').length,
  excel: templates.value.filter(t => t.templateType === 'EXCEL').length,
  default: templates.value.filter(t => t.isDefault).length,
}));

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  if (!filterType.value) return templates.value;
  return templates.value.filter(t => t.templateType === filterType.value);
});

// 当前操作的模板
const currentTemplate = ref<DocumentTemplate | null>(null);
const selectedTemplateForDesign = ref<DocumentTemplate | null>(null);

// 对话框显示状态
const dialogVisible = ref(false);
const designerVisible = ref(false);
const exportVisible = ref(false);
const uploadVisible = ref(false);
const historyVisible = ref(false);
const configTemplateDialogVisible = ref(false);
const importResultVisible = ref(false);
const fieldDialogVisible = ref(false);

// 对话框标题
const dialogTitle = ref('新建模板');
const fieldDialogTitle = ref('新建系统字段');

// 表单引用
const formRef = ref<FormInstance>();
const designerRef = ref<InstanceType<typeof DocumentFormDesigner> | null>(null);
const uploadRef = ref<UploadInstance>();

// 表单数据
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

// 导出表单
const exportForm = ref({
  fileName: '',
  dataJson: '',
});

// 上传文件
const selectedFile = ref<File | null>(null);

// 配置模板对话框
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

// 表单验证规则
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

// 导入导出相关
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

// 搜索加载状态
const fieldSearchLoading = ref<boolean[]>([]);

// 过滤后的字段分组（用于字段选择器）
const fieldSelectorFieldGroups = ref<Array<Array<{
  group: string;
  fields: Array<{
    label: string;
    value: string;
    sortOrder: number;
    description?: string;
  }>;
}>>([]);

// 系统字段管理相关状态
const systemFieldsList = ref<Array<{
  id: number;
  groupName: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}>>([]);

// 字段表单数据
const fieldForm = ref({
  id: undefined as number | undefined,
  groupName: '',
  label: '',
  value: '',
  sortOrder: 1,
  description: ''
});

// 字段表单验证规则
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

// 字段分组列表
const fieldGroups = ref<string[]>(['基本信息', '债权信息', '联系人信息', '银行信息', '其他信息']);

// 搜索相关状态
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

// 分页相关状态
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

// 可用的分组列表
const availableGroups = ref<string[]>([]);

// 加载模板列表
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

// 筛选变化
const handleFilterChange = () => {
  // 筛选已在计算属性中处理
};

// 显示创建对话框
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

// 显示编辑对话框
const showEditDialog = (template: DocumentTemplate) => {
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
  dialogVisible.value = true;
};

// 显示配置模板对话框
const showConfigTemplateDialog = () => {
  configTemplateDialogVisible.value = true;
};

// 选择配置模板
const selectConfigTemplate = (template: any) => {
  templateForm.value.configJson = JSON.stringify(template.config, null, 2);
  configTemplateDialogVisible.value = false;
  ElMessage.success(`已选择模板: ${template.name}`);
};

// 保存模板
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

// 显示设计器对话框
const showDesignDialog = async (template: DocumentTemplate) => {
  currentTemplate.value = template;
  designerVisible.value = true;

  // 加载模板详情获取字段配置
  try {
    const response = await documentTemplatesApi.getTemplateFields(template.id);
    if (response.code === 200 && designerRef.value) {
      const fields = response.data;
      if (fields) {
        designerRef.value.setTemplateFields(fields, template.templateType);
      }
    }
  } catch (error) {
    console.error('加载模板字段失败:', error);
  }
};

// 显示表单设计器对话框
const showFormDesignerDialog = () => {
  if (!selectedTemplateForDesign.value) {
    ElMessage.warning('请先选择要设计的模板');
    return;
  }
  showDesignDialog(selectedTemplateForDesign.value);
};

// 保存设计器配置
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

// 显示导出对话框
const showExportDialog = (template: DocumentTemplate) => {
  currentTemplate.value = template;
  exportForm.value = {
    fileName: template.templateName,
    dataJson: '',
  };
  exportVisible.value = true;
};

// 处理模板导出
const handleTemplateExport = async () => {
  if (!currentTemplate.value) return;

  exporting.value = true;
  try {
    let data;
    try {
      data = JSON.parse(exportForm.value.dataJson || '{}');
    } catch {
      ElMessage.error('导出数据JSON格式错误');
      return;
    }

    const requestData = {
      templateId: currentTemplate.value.id,
      fileName: exportForm.value.fileName,
      data,
    };

    let response;
    if (currentTemplate.value.templateType === 'WORD') {
      response = await documentTemplatesApi.exportWord(currentTemplate.value.id, requestData);
    } else {
      response = await documentTemplatesApi.exportExcel(currentTemplate.value.id, requestData);
    }

    // 下载文件
    const blob = new Blob([response.data], {
      type: currentTemplate.value.templateType === 'WORD'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportForm.value.fileName}.${currentTemplate.value.templateType === 'WORD' ? 'docx' : 'xlsx'}`;
    link.click();
    URL.revokeObjectURL(link.href);

    ElMessage.success('导出成功');
    exportVisible.value = false;
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 处理更多命令
const handleCommand = async (command: string, template: DocumentTemplate) => {
  currentTemplate.value = template;

  switch (command) {
    case 'upload':
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

// 设置默认模板
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

// 删除模板
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

// 状态变化
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

// 文件上传相关
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

// 加载导出历史
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

    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败');
  }
};

// 导入Excel
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

      // 清空文件选择
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

// 导出数据
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

    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage.error('导出数据失败');
  }
};

// 加载系统字段分组（用于字段选择器）
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
    } else {
      ElMessage.error('加载系统字段失败: ' + response.message);
    }
  } catch (error: any) {
    ElMessage.error('加载系统字段失败: ' + (error.message || '未知错误'));
  }
};

// 加载系统字段列表（用于字段管理）
const loadSystemFieldsList = async () => {
  try {
    // 由于 API 中没有直接获取所有字段的接口，我们需要从分组中提取
    // 首先调用 getSystemFields 获取所有分组
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
      
      // 遍历所有分组，提取字段信息
      response.data.forEach((group) => {
        group.fields.forEach((field, index) => {
          fields.push({
            id: index + 1, // 临时ID，实际应该从后端获取
            groupName: group.group,
            label: field.label,
            value: field.value,
            sortOrder: field.sortOrder,
            description: field.description
          });
        });
      });
      
      systemFieldsList.value = fields;
      filteredSystemFields.value = fields;
      // 提取可用的分组列表
      extractAvailableGroups();
      // 计算分页数据
      calculatePagedFields();
    } else {
      ElMessage.error('加载系统字段列表失败: ' + response.message);
    }
  } catch (error: any) {
    ElMessage.error('加载系统字段列表失败: ' + (error.message || '未知错误'));
  }
};

// 提取可用的分组列表
const extractAvailableGroups = () => {
  const groups = new Set<string>();
  systemFieldsList.value.forEach(field => {
    groups.add(field.groupName);
  });
  availableGroups.value = Array.from(groups).sort();
};

// 计算分页数据
const calculatePagedFields = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  pagedSystemFields.value = filteredSystemFields.value.slice(startIndex, endIndex);
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  calculatePagedFields();
};

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  calculatePagedFields();
};

// 处理系统字段搜索
const handleSystemFieldSearch = () => {
  applyFilters();
};

// 处理分组变更
const handleGroupChange = () => {
  applyFilters();
};

// 应用筛选条件
const applyFilters = () => {
  let filtered = systemFieldsList.value;
  
  // 按分组筛选
  if (selectedGroup.value) {
    filtered = filtered.filter(field => field.groupName === selectedGroup.value);
  }
  
  // 按搜索词筛选
  if (fieldSearchQuery.value) {
    const query = fieldSearchQuery.value.toLowerCase();
    filtered = filtered.filter(field => 
      field.label.toLowerCase().includes(query) ||
      field.value.toLowerCase().includes(query) ||
      field.groupName.toLowerCase().includes(query)
    );
  }
  
  filteredSystemFields.value = filtered;
  currentPage.value = 1; // 重置到第一页
  calculatePagedFields();
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

// 添加字段映射
const addMapping = () => {
  templateForm.value.mappings.push({
    excelHeader: '',
    targetField: ''
  });
  // 初始化搜索相关状态
  const newIndex = templateForm.value.mappings.length - 1;
  fieldSearchLoading.value[newIndex] = false;
  // 确保即使 systemFieldGroups.value 是 falsy 值，也能正确初始化
  fieldSelectorFieldGroups.value[newIndex] = systemFieldGroups.value || [];
};

// 移除字段映射
const removeMapping = (index: number) => {
  templateForm.value.mappings.splice(index, 1);
  // 清理搜索相关状态
  fieldSearchLoading.value.splice(index, 1);
  fieldSelectorFieldGroups.value.splice(index, 1);
};

// 字段选择器搜索处理函数
const handleFieldSelectorSearch = (index: number, query: string) => {
  // 确保 systemFieldGroups.value 是数组
  const fieldGroups = systemFieldGroups.value || [];
  
  if (!query.trim()) {
    // 清空搜索时显示所有字段
    fieldSelectorFieldGroups.value[index] = fieldGroups;
    return;
  }

  // 设置搜索加载状态
  fieldSearchLoading.value[index] = true;

  // 模拟异步搜索（实际项目中可以调用后端搜索接口）
  setTimeout(() => {
    const lowercaseQuery = query.toLowerCase();
    
    // 过滤字段分组
    const filteredGroups = fieldGroups.map(group => {
      const filteredFields = group.fields.filter(field => {
        // 搜索条件：匹配字段标签或值
        return field.label.toLowerCase().includes(lowercaseQuery) ||
               field.value.toLowerCase().includes(lowercaseQuery);
      });
      
      return {
        ...group,
        fields: filteredFields
      };
    }).filter(group => group.fields.length > 0);
    
    fieldSelectorFieldGroups.value[index] = filteredGroups;
    fieldSearchLoading.value[index] = false;
  }, 300);
};

// 显示创建字段对话框
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

// 显示编辑字段对话框
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

// 保存系统字段
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
      // 更新字段
      response = await excelTemplatesApi.updateSystemField(fieldForm.value.id, request);
    } else {
      // 创建字段
      response = await excelTemplatesApi.createSystemField(request);
    }

    if (response.code === 200) {
      ElMessage.success(fieldForm.value.id ? '更新成功' : '创建成功');
      fieldDialogVisible.value = false;
      // 重新加载字段数据
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

// 删除系统字段
const deleteField = async (field: any) => {
  try {
    const response = await excelTemplatesApi.deleteSystemField(field.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      // 重新加载字段数据
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

// 格式化日期
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

// 组件挂载时加载数据
onMounted(async () => {
  await loadTemplates();
  await loadSystemFields();
  await loadSystemFieldsList();
});
</script>
