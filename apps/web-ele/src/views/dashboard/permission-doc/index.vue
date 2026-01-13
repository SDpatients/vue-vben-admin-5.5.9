<script setup lang="ts">
import { computed, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { Icon } from '@iconify/vue';
import {
  ElAlert,
  ElCard,
  ElCollapse,
  ElCollapseItem,
  ElDescriptions,
  ElDescriptionsItem,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

const accessStore = useAccessStore();
const activeNames = ref(['1', '2', '3', '4', '5']);

const permissions = computed(() => accessStore.accessCodes);

const permissionData = [
  {
    permCode: 'activity:view:own',
    permName: '查看自己的动态',
    roles: ['LAWYER', 'REVIEWER', 'ADMIN'],
    description: '用户可以查看自己创建的动态记录',
    trigger: '用户登录后自动获取',
  },
  {
    permCode: 'activity:view:all',
    permName: '查看所有用户的动态',
    roles: ['REVIEWER', 'ADMIN'],
    description: '审核员和管理员可以查看所有用户的动态记录',
    trigger: '需要管理员分配该权限',
  },
  {
    permCode: 'todo:view:own',
    permName: '查看自己的待办',
    roles: ['LAWYER', 'REVIEWER', 'ADMIN'],
    description: '用户可以查看和管理自己的待办事项',
    trigger: '用户登录后自动获取',
  },
  {
    permCode: 'todo:view:all',
    permName: '查看所有用户的待办',
    roles: ['REVIEWER', 'ADMIN'],
    description: '审核员和管理员可以查看所有用户的待办事项',
    trigger: '需要管理员分配该权限',
  },
  {
    permCode: 'todo:create:own',
    permName: '创建自己的待办',
    roles: ['LAWYER', 'REVIEWER', 'ADMIN'],
    description: '用户可以为自己创建待办事项',
    trigger: '用户登录后自动获取',
  },
  {
    permCode: 'todo:create:all',
    permName: '为其他用户创建待办',
    roles: ['ADMIN'],
    description: '管理员可以为其他用户创建待办事项',
    trigger: '需要管理员分配该权限',
  },
];

const activityTriggers = [
  {
    type: 'CREATE_CASE',
    name: '创建案件',
    description: '当用户创建新案件时自动触发',
    targetUser: '当前用户',
    content: '用户名 创建了新案件：案件名称',
  },
  {
    type: 'UPDATE_CASE',
    name: '更新案件',
    description: '当用户更新案件信息时自动触发',
    targetUser: '当前用户',
    content: '用户名 更新了案件：案件名称',
  },
  {
    type: 'DELETE_CASE',
    name: '删除案件',
    description: '当用户删除案件时自动触发',
    targetUser: '当前用户',
    content: '用户名 删除了案件：案件名称',
  },
  {
    type: 'SUBMIT',
    name: '提交审核',
    description: '当用户提交审核申请时自动触发',
    targetUser: '当前用户',
    content: '用户名 提交审核申请：审核标题',
  },
  {
    type: 'APPROVE_PASS',
    name: '审核通过',
    description: '当审核员审核通过时自动触发',
    targetUser: '审核员',
    content: '审核员名 审核通过：审核标题',
  },
  {
    type: 'APPROVE_REJECT',
    name: '审核驳回',
    description: '当审核员审核驳回时自动触发',
    targetUser: '审核员',
    content: '审核员名 审核驳回：审核标题',
  },
  {
    type: 'CREATE_TODO',
    name: '创建待办',
    description: '当用户创建待办事项时自动触发',
    targetUser: '当前用户',
    content: '用户名 创建了待办事项：待办标题',
  },
  {
    type: 'COMPLETE_TODO',
    name: '完成待办',
    description: '当用户完成待办事项时自动触发',
    targetUser: '当前用户',
    content: '用户名 完成了待办事项：待办标题',
  },
  {
    type: 'CANCEL_TODO',
    name: '取消待办',
    description: '当用户取消待办事项时自动触发',
    targetUser: '当前用户',
    content: '用户名 取消了待办事项：待办标题',
  },
  {
    type: 'DELETE_TODO',
    name: '删除待办',
    description: '当用户删除待办事项时自动触发',
    targetUser: '当前用户',
    content: '用户名 删除了待办事项：待办标题',
  },
];

const todoTriggers = [
  {
    sourceType: 'APPROVAL',
    name: '审核流程自动创建',
    description: '当用户提交审核申请时，系统自动为审核人创建待办事项',
    targetUser: '审核人',
    priority: 'HIGH',
    status: 'PENDING',
    example: '审核任务：案件001审核',
  },
  {
    sourceType: 'MANUAL',
    name: '手动创建',
    description: '用户可以手动为自己创建待办事项',
    targetUser: '当前用户',
    priority: 'MEDIUM',
    status: 'PENDING',
    example: '准备案件材料',
  },
  {
    sourceType: 'SYSTEM',
    name: '系统分配',
    description: '管理员可以为其他用户创建待办事项',
    targetUser: '指定用户',
    priority: 'MEDIUM',
    status: 'PENDING',
    example: '完成月度报告',
  },
];

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    LAWYER: 'primary',
    REVIEWER: 'success',
    ADMIN: 'danger',
  };
  return colorMap[role] || 'info';
};

const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    LAWYER: '律师',
    REVIEWER: '审核员',
    ADMIN: '管理员',
  };
  return textMap[role] || role;
};

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'success',
  };
  return colorMap[priority] || 'info';
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    PENDING: 'warning',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info',
  };
  return colorMap[status] || 'info';
};

const hasPermission = (permCode: string) => {
  return permissions.value.includes(permCode);
};
</script>

<template>
  <div class="permission-doc-container">
    <div class="doc-header">
      <h1>动态与待办事项权限配置说明</h1>
      <p>本文档详细说明了动态和待办事项的权限控制、触发时机和查看范围</p>
    </div>

    <ElAlert
      title="当前用户权限"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 24px"
    >
      <template #default>
        <div class="current-permissions">
          <span>您当前拥有的权限：</span>
          <ElTag
            v-for="perm in permissions"
            :key="perm"
            type="success"
            size="small"
            style="margin: 4px"
          >
            {{ perm }}
          </ElTag>
<<<<<<< Updated upstream
          <span v-if="permissions.length === 0" style="color: #999; margin-left: 8px">暂无权限</span>
=======
          <span
            v-if="permissions.length === 0"
            style="margin-left: 8px; color: #999"
            >暂无权限</span
          >
>>>>>>> Stashed changes
        </div>
      </template>
    </ElAlert>

    <ElCollapse v-model="activeNames">
      <ElCollapseItem title="1. 权限定义与说明" name="1">
        <ElCard shadow="never">
          <ElTable :data="permissionData" border style="width: 100%">
            <ElTableColumn prop="permCode" label="权限编码" width="180" />
            <ElTableColumn prop="permName" label="权限名称" width="160" />
            <ElTableColumn prop="roles" label="适用角色" width="200">
              <template #default="{ row }">
                <ElTag
                  v-for="role in row.roles"
                  :key="role"
                  :type="getRoleColor(role)"
                  size="small"
                  style="margin: 2px"
                >
                  {{ getRoleText(role) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="权限说明" />
            <ElTableColumn prop="trigger" label="获取时机" width="160" />
            <ElTableColumn label="当前拥有" width="100">
              <template #default="{ row }">
                <ElTag
                  :type="hasPermission(row.permCode) ? 'success' : 'info'"
                  size="small"
                >
                  {{ hasPermission(row.permCode) ? '是' : '否' }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCollapseItem>

      <ElCollapseItem title="2. 动态触发时机说明" name="2">
        <ElCard shadow="never">
          <ElAlert
            title="动态自动创建说明"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            以下操作会自动创建动态记录，记录用户的操作行为
          </ElAlert>
          <ElTable :data="activityTriggers" border style="width: 100%">
            <ElTableColumn prop="type" label="动态类型" width="140" />
            <ElTableColumn prop="name" label="操作名称" width="120" />
            <ElTableColumn prop="description" label="触发条件" />
            <ElTableColumn prop="targetUser" label="记录用户" width="120" />
            <ElTableColumn prop="content" label="动态内容示例" />
          </ElTable>
        </ElCard>
      </ElCollapseItem>

      <ElCollapseItem title="3. 待办事项触发时机说明" name="3">
        <ElCard shadow="never">
          <ElAlert
            title="待办事项自动创建说明"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            以下情况会自动创建待办事项
          </ElAlert>
          <ElTable :data="todoTriggers" border style="width: 100%">
            <ElTableColumn prop="sourceType" label="来源类型" width="120" />
            <ElTableColumn prop="name" label="创建方式" width="160" />
            <ElTableColumn prop="description" label="触发条件" />
            <ElTableColumn prop="targetUser" label="目标用户" width="120" />
            <ElTableColumn prop="priority" label="默认优先级" width="100">
              <template #default="{ row }">
                <ElTag :type="getPriorityColor(row.priority)" size="small">
                  {{ row.priority }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="默认状态" width="100">
              <template #default="{ row }">
                <ElTag :type="getStatusColor(row.status)" size="small">
                  {{ row.status }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="example" label="示例" width="200" />
          </ElTable>
        </ElCard>
      </ElCollapseItem>

      <ElCollapseItem title="4. 权限矩阵" name="4">
        <ElCard shadow="never">
          <ElTable :data="permissionData" border style="width: 100%">
            <ElTableColumn label="操作" width="200" fixed="left">
              <template #default="{ row }">
                {{ row.permName }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="律师 (LAWYER)" width="120" align="center">
              <template #default="{ row }">
                <Icon
                  :icon="
                    row.roles.includes('LAWYER')
                      ? 'lucide:check-circle'
                      : 'lucide:x-circle'
                  "
                  :color="row.roles.includes('LAWYER') ? '#52c41a' : '#ff4d4f'"
                  :size="20"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="审核员 (REVIEWER)" width="120" align="center">
              <template #default="{ row }">
                <Icon
                  :icon="
                    row.roles.includes('REVIEWER')
                      ? 'lucide:check-circle'
                      : 'lucide:x-circle'
                  "
                  :color="
                    row.roles.includes('REVIEWER') ? '#52c41a' : '#ff4d4f'
                  "
                  :size="20"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="管理员 (ADMIN)" width="120" align="center">
              <template #default="{ row }">
                <Icon
                  :icon="
                    row.roles.includes('ADMIN')
                      ? 'lucide:check-circle'
                      : 'lucide:x-circle'
                  "
                  :color="row.roles.includes('ADMIN') ? '#52c41a' : '#ff4d4f'"
                  :size="20"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="说明" />
          </ElTable>
        </ElCard>
      </ElCollapseItem>

      <ElCollapseItem title="5. 使用场景示例" name="5">
        <div class="scenario-section">
          <ElCard shadow="never" style="margin-bottom: 16px">
            <template #header>
              <div class="card-header">
                <Icon icon="lucide:user" :size="20" />
                <span>场景一：普通用户查看自己的动态和待办</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="用户角色">
                律师 (LAWYER)
              </ElDescriptionsItem>
              <ElDescriptionsItem label="所需权限">
                <ElTag type="success" size="small">activity:view:own</ElTag>
                <ElTag type="success" size="small">todo:view:own</ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="操作流程">
                1. 用户登录系统 → 2. 进入工作台页面 → 3. 查看我的动态和我的待办
              </ElDescriptionsItem>
              <ElDescriptionsItem label="查看范围">
                只能查看自己创建的动态和待办事项
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>

          <ElCard shadow="never" style="margin-bottom: 16px">
            <template #header>
              <div class="card-header">
                <Icon icon="lucide:shield-check" :size="20" />
                <span>场景二：审核员查看所有用户的动态和待办</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="用户角色">
                审核员 (REVIEWER)
              </ElDescriptionsItem>
              <ElDescriptionsItem label="所需权限">
                <ElTag type="success" size="small">activity:view:all</ElTag>
                <ElTag type="success" size="small">todo:view:all</ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="操作流程">
                1. 审核员登录系统 → 2. 进入动态与待办管理页面 → 3.
                查看所有用户的动态和待办
              </ElDescriptionsItem>
              <ElDescriptionsItem label="查看范围">
                可以查看所有用户的动态和待办事项
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>

          <ElCard shadow="never" style="margin-bottom: 16px">
            <template #header>
              <div class="card-header">
                <Icon icon="lucide:user-cog" :size="20" />
                <span>场景三：管理员为用户创建待办事项</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="用户角色">
                管理员 (ADMIN)
              </ElDescriptionsItem>
              <ElDescriptionsItem label="所需权限">
                <ElTag type="danger" size="small">todo:create:all</ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="操作流程">
                1. 管理员登录系统 → 2. 进入待办管理页面 → 3.
                点击"为用户创建待办"按钮 → 4. 选择目标用户并填写待办信息 → 5.
                创建待办
              </ElDescriptionsItem>
              <ElDescriptionsItem label="创建范围">
                可以为任何用户创建待办事项
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>

          <ElCard shadow="never">
            <template #header>
              <div class="card-header">
                <Icon icon="lucide:workflow" :size="20" />
                <span>场景四：用户提交审核自动创建待办</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="触发用户">
                律师 (LAWYER)
              </ElDescriptionsItem>
              <ElDescriptionsItem label="触发条件">
                用户创建案件并提交审核
              </ElDescriptionsItem>
              <ElDescriptionsItem label="自动创建内容">
                1. 为审核人创建待办事项（优先级：HIGH，状态：PENDING）<br />
                2. 记录动态（类型：SUBMIT，内容：提交审核申请）<br />
                3. 发送通知给审核人
              </ElDescriptionsItem>
              <ElDescriptionsItem label="目标用户">
                审核人（由系统指定）
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>
        </div>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<style scoped>
.permission-doc-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.doc-header {
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.doc-header h1 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.doc-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.current-permissions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.scenario-section {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}
</style>
