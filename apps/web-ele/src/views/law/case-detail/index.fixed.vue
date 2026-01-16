<template>
  <div class="case-detail-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <ElButton type="primary" link @click="goBack">
        <Icon icon="lucide:arrow-left" class="mr-2" />
        返回案件列表
      </ElButton>
      <h1 class="page-title">案件详情</h1>
      <div class="header-actions">
        <ElButton type="primary" @click="openFundControlDrawer">
          <Icon icon="lucide:landmark" class="mr-2" />
          资金管控
        </ElButton>
        <ElButton type="primary" @click="openArchiveDrawer">
          <Icon icon="lucide:archive" class="mr-2" />
          案件卷宗归档
        </ElButton>
        <ElButton
          type="primary"
          @click="router.push('/basic-data/work-plan-management')"
        >
          <Icon icon="lucide:calendar" class="mr-2" />
          工作计划
        </ElButton>
      </div>
    </div>

      <!-- 内容类型切换 -->
      <div class="content-tabs mb-6">
        <ElRadioGroup v-model="activeTab" size="large" class="tabs-container">
          <ElRadioButton value="caseInfo" class="tab-button">案件基本信息</ElRadioButton>
          <ElRadioButton value="workTeam" class="tab-button">工作团队</ElRadioButton>
          <ElRadioButton value="process" class="tab-button">流程处理</ElRadioButton>
          <ElRadioButton value="creditorInfo" class="tab-button">债权人信息</ElRadioButton>
          <ElRadioButton value="claimRegistration" class="tab-button">债权登记表</ElRadioButton>
          <ElRadioButton value="announcement" class="tab-button">公告管理</ElRadioButton>
        </ElRadioGroup>
      </div>

      <!-- 案件基本信息卡片 -->
      <div v-if="activeTab === 'caseInfo'">
        <ElCard class="case-info-card" shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:file-text" class="mr-2 text-blue-500" />
                <span class="text-lg font-semibold">案件基本信息</span>
              </div>
              <div class="flex space-x-2">
                <template v-if="!isEditing && canEdit">
                  <ElButton type="primary" @click="startEditing">
                    <Icon icon="lucide:pencil" class="mr-1" />
                    编辑
                  </ElButton>
                </template>
                <template v-else-if="isEditing && canEdit">
                  <ElButton
                    type="success"
                    @click="saveEditing"
                    :loading="saveLoading"
                  >
                    <Icon icon="lucide:save" class="mr-1" />
                    保存
                  </ElButton>
                  <ElButton @click="cancelEditing" :disabled="saveLoading">
                    <Icon icon="lucide:x" class="mr-1" />
                    取消
                  </ElButton>
                </template>
                <ElButton link @click="isInfoCollapsed = !isInfoCollapsed">
                  <Icon
                    :icon="
                      isInfoCollapsed
                        ? 'lucide:chevron-down'
                        : 'lucide:chevron-up'
                    "
                    class="ml-1"
                  />
                  {{ isInfoCollapsed ? '展开详情' : '收起详情' }}
                </ElButton>
              </div>
            </div>
          </template>

          <div v-if="loading" class="loading-container">
            <ElSkeleton :rows="5" animated />
          </div>

          <div v-else-if="caseDetail" class="case-info-content">
            <!-- 关键信息概览 -->
            <div class="key-info-overview mb-6">
              <ElRow :gutter="20">
                <ElCol :span="8">
                  <div class="key-info-item p-4 rounded-lg border border-gray-200">
                    <div class="key-info-label mb-1 text-sm text-gray-500">案件编号</div>
                    <div class="key-info-value font-semibold text-xl">{{ caseDetail.案件编号 }}</div>
                  </div>
                </ElCol>
                <ElCol :span="8">
                  <div class="key-info-item p-4 rounded-lg border border-gray-200">
                    <div class="key-info-label mb-1 text-sm text-gray-500">案件名称</div>
                    <div class="key-info-value font-semibold text-xl">{{ caseDetail.案件名称 }}</div>
                  </div>
                </ElCol>
                <ElCol :span="8">
                  <div class="key-info-item p-4 rounded-lg border border-gray-200">
                    <div class="key-info-label mb-1 text-sm text-gray-500">案件状态</div>
                    <div class="key-info-value font-semibold text-xl">{{ caseDetail.案件状态 }}</div>
                  </div>
                </ElCol>
              </ElRow>
            </div>

            <!-- 详细信息 -->
            <div v-show="!isInfoCollapsed" class="detail-info-grid">
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">案由</div>
                      <div class="detail-info-value">{{ caseDetail.案由 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">案件来源</div>
                      <div class="detail-info-value">{{ caseDetail.案件来源 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">案件进度</div>
                      <div class="detail-info-value">{{ caseDetail.案件进度 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">是否简化审</div>
                      <div class="detail-info-value">{{ caseDetail.是否简化审 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">受理法院</div>
                      <div class="detail-info-value">{{ caseDetail.受理法院 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">管理人</div>
                      <div class="detail-info-value">{{ caseDetail.管理人 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">主要负责人</div>
                      <div class="detail-info-value">{{ caseDetail.主要负责人 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">指定法官</div>
                      <div class="detail-info-value">{{ caseDetail.指定法官 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">承办人</div>
                      <div class="detail-info-value">{{ caseDetail.承办人 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">创建者</div>
                      <div class="detail-info-value">{{ caseDetail.创建者 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">创建时间</div>
                      <div class="detail-info-value">{{ caseDetail.创建时间 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">修改时间</div>
                      <div class="detail-info-value">{{ caseDetail.修改时间 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">审核状态</div>
                      <div class="detail-info-value">{{ caseDetail.审核状态 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">审核时间</div>
                      <div class="detail-info-value">{{ caseDetail.审核时间 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">审核意见</div>
                      <div class="detail-info-value">{{ caseDetail.审核意见 }}</div>
                    </div>
                  </div>
                </ElCol>
                <ElCol :span="12">
                  <div class="detail-info-item p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                      <div class="detail-info-label">审核次数</div>
                      <div class="detail-info-value">{{ caseDetail.审核次数 }}</div>
                    </div>
                  </div>
                </ElCol>
              </ElRow>
            </div>
          </div>

          <div v-else class="error-container">
            <ElEmpty description="获取案件信息失败" />
          </div>
        </ElCard>
      </div>

      <!-- 工作团队管理 -->
      <div v-if="activeTab === 'workTeam'">
        <ElCard class="case-info-card" shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:users" class="mr-2 text-blue-500" />
                <span class="text-lg font-semibold">工作团队管理</span>
              </div>
            </div>
          </template>

          <div class="work-team-content">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <h3 class="text-lg font-semibold mb-4">团队成员</h3>
                <div v-if="workTeamLoading" class="loading-container">
                  <ElSkeleton :rows="5" animated />
                </div>
                <div v-else-if="teamMembers.length > 0">
                  <ElTable :data="teamMembers" border stripe style="width: 100%">
                    <ElTableColumn prop="userId" label="用户ID" width="180" />
                    <ElTableColumn prop="userName" label="用户名" width="180" />
                    <ElTableColumn prop="teamRole" label="团队角色" width="180" />
                    <ElTableColumn prop="permissionLevel" label="权限级别" width="180" />
                    <ElTableColumn label="操作" width="200">
                      <template #default="scope">
                        <ElButton type="danger" size="small" link @click="removeTeamMember(scope.row.id)">
                          <Icon icon="lucide:trash-2" />
                          移除
                        </ElButton>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>
                <div v-else class="empty-state">
                  <ElEmpty description="暂无团队成员" />
                </div>
              </ElCol>

              <ElCol :span="12">
                <h3 class="text-lg font-semibold mb-4">添加成员</h3>
                <ElForm :model="memberForm" label-width="120px">
                  <ElFormItem label="用户选择">
                    <ElSelect v-model="memberForm.userId" placeholder="请选择用户">
                      <ElOption
                        v-for="user in availableUsers"
                        :key="user.id"
                        :label="user.name"
                        :value="user.id"
                      />
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem label="团队角色">
                    <ElSelect v-model="memberForm.teamRole" placeholder="请选择角色">
                      <ElOption
                        v-for="role in teamRoles"
                        :key="role.id"
                        :label="role.name"
                        :value="role.name"
                      />
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem label="权限级别">
                    <ElSelect v-model="memberForm.permissionLevel" placeholder="请选择权限">
                      <ElOption label="查看" value="VIEW" />
                      <ElOption label="编辑" value="EDIT" />
                      <ElOption label="管理" value="ADMIN" />
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem>
                    <ElButton type="primary" @click="addTeamMember" :loading="savingMember">
                      <Icon icon="lucide:plus" />
                      添加成员
                    </ElButton>
                  </ElFormItem>
                </ElForm>
              </ElCol>
            </ElRow>
          </div>
        </ElCard>
      </div>

      <!-- 流程处理 -->
      <div v-if="activeTab === 'process'">
        <ElCard class="case-info-card" shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="process-header">
                <h2 class="process-title">{{ stages[currentStage - 1].name }}</h2>
                <p class="process-description">{{ stages[currentStage - 1].description }}</p>
              </div>
            </div>
          </template>

          <div class="process-content">
            <!-- 阶段导航 -->
            <div class="stage-navigation">
              <div class="stage-indicators">
                <div
                  v-for="stage in stages"
                  :key="stage.id"
                  :class="['stage-dot', { active: currentStage === stage.id }]"
                  @click="currentStage = stage.id"
                >
                  <span class="stage-number">{{ stage.id }}</span>
                  <div class="stage-tooltip">
                    <div class="stage-tooltip-name">{{ stage.name }}</div>
                    <div class="stage-tooltip-desc">{{ stage.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 阶段内容 -->
            <div class="stage-content p-6 bg-white rounded-lg border border-gray-200">
              <!-- 阶段一 -->
              <div v-if="currentStage === 1">
                <StageOneProcess :case-id="caseId" />
              </div>
              <!-- 阶段二 -->
              <div v-else-if="currentStage === 2">
                <StageTwoProcess :case-id="caseId" />
              </div>
              <!-- 阶段三 -->
              <div v-else-if="currentStage === 3">
                <StageThreeProcess :case-id="caseId" />
              </div>
              <!-- 阶段四 -->
              <div v-else-if="currentStage === 4">
                <StageFourProcess :case-id="caseId" />
              </div>
              <!-- 阶段五 -->
              <div v-else-if="currentStage === 5">
                <StageFiveProcess :case-id="caseId" />
              </div>
              <!-- 阶段六 -->
              <div v-else-if="currentStage === 6">
                <StageSixProcess :case-id="caseId" />
              </div>
              <!-- 阶段七 -->
              <div v-else-if="currentStage === 7">
                <StageSevenProcess :case-id="caseId" />
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 债权人信息 -->
      <div v-if="activeTab === 'creditorInfo'">
        <CreditorInfo :case-id="caseId" />
      </div>

      <!-- 债权登记表 -->
      <div v-if="activeTab === 'claimRegistration'">
        <ClaimRegistration :case-id="caseId" />
      </div>

      <!-- 公告管理 -->
      <div v-if="activeTab === 'announcement'">
        <ElCard class="case-info-card" shadow="hover">
          <template #header>
            <div class="card-header flex items-center justify-between">
              <div class="flex items-center">
                <Icon icon="lucide:bell" class="mr-2 text-blue-500" />
                <span class="text-lg font-semibold">公告管理</span>
              </div>
              <div>
                <ElButton type="primary" @click="openNewAnnouncementDialog">
                  <Icon icon="lucide:plus" class="mr-1" />
                  发布新公告
                </ElButton>
              </div>
            </div>
          </template>

          <div class="announcement-content">
            <!-- 公告列表 -->
            <div class="mb-6">
              <ElTable :data="announcements" border stripe style="width: 100%">
                <ElTableColumn prop="title" label="公告标题" min-width="200" />
                <ElTableColumn prop="announcement_type" label="公告类型" width="120" />
                <ElTableColumn prop="status" label="状态" width="100">
                  <template #default="scope">
                    <ElTag :type="scope.row.status === 'PUBLISHED' ? 'success' : 'info'">
                      {{ scope.row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="is_top" label="置顶" width="80">
                  <template #default="scope">
                    <ElSwitch v-model="scope.row.is_top" disabled />
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="publish_time" label="发布时间" width="180" />
                <ElTableColumn prop="view_count" label="浏览量" width="100">
                  <template #default="scope">
                    <div class="view-count-cell">
                      <Icon icon="lucide:eye" class="eye-icon" />
                      {{ scope.row.view_count }}
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="attachments" label="附件" width="120">
                  <template #default="scope">
                    <div class="attachment-count-cell">
                      <Icon icon="lucide:paperclip" class="attachment-icon" />
                      {{ scope.row.attachments?.length || 0 }}
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="250">
                  <template #default="scope">
                    <ElButton type="primary" size="small" link @click="viewAnnouncementDetail(scope.row)">
                      <Icon icon="lucide:eye" />
                      查看
                    </ElButton>
                    <ElButton type="primary" size="small" link @click="editAnnouncement(scope.row)">
                      <Icon icon="lucide:pencil" />
                      编辑
                    </ElButton>
                    <ElButton type="danger" size="small" link @click="deleteAnnouncement(scope.row)">
                      <Icon icon="lucide:trash-2" />
                      删除
                    </ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>

              <!-- 分页 -->
              <div class="flex justify-center mt-4">
                <ElPagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalAnnouncements"
                  @size-change="fetchAnnouncements"
                  @current-change="fetchAnnouncements"
                />
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 卷宗归档抽屉 -->
      <ArchiveDrawer ref="archiveDrawerRef" :case-id="caseId" />

      <!-- 资金管控抽屉 -->
      <FundControlDrawer 
        ref="fundControlDrawerRef" 
        :case-id="caseId" 
        :case-no="caseDetail?.案件编号 || ''"
        :case-name="caseDetail?.案件名称 || ''"
      />
  </div>
</template>