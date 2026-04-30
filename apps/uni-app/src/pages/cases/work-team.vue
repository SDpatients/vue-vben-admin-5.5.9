<template>
  <view class="work-team-container">
    <view class="header">
      <text class="title">工作团队</text>
      <text class="subtitle">案件编号：{{ caseNo }}</text>
    </view>

    <view class="content">
      <view class="loading-container" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="empty-state" v-else-if="!loading && teamList.length === 0">
        <text class="empty-text">暂无工作团队数据</text>
        <button class="add-btn" size="mini" @click="showCreateTeamDialog">
          创建团队
        </button>
      </view>

      <view class="team-list" v-else>
        <view class="team-item" v-for="team in teamList" :key="team.id">
          <view class="team-header" @click="toggleTeamMembers(team)">
            <view class="team-header-left">
              <text class="team-name">{{ team.teamName || '未命名团队' }}</text>
              <text class="member-count">{{ team.members ? team.members.length : 0 }}人</text>
            </view>
            <view class="team-header-right">
              <text class="leader-name">负责人：{{ team.teamLeaderName || '-' }}</text>
              <text class="expand-icon">{{ expandedTeams.has(team.id) ? '▼' : '▶' }}</text>
            </view>
          </view>

          <view class="team-description" v-if="team.teamDescription">
            <text>{{ team.teamDescription }}</text>
          </view>

          <view class="members-section" v-show="expandedTeams.has(team.id)">
            <view class="members-header">
              <text class="members-title">团队成员</text>
              <button class="add-member-btn" size="mini" @click.stop="showAddMemberDialog(team)">
                添加成员
              </button>
            </view>

            <view class="member-loading" v-if="team.membersLoading">
              <text>加载成员中...</text>
            </view>

            <view class="member-empty" v-else-if="!team.members || team.members.length === 0">
              <text>暂无成员</text>
            </view>

            <view class="member-list" v-else>
              <view class="member-item" v-for="member in team.members" :key="member.id">
                <view class="member-info">
                  <view class="member-name-row">
                    <text class="member-name">{{ member.userRealName || member.userName || '未知' }}</text>
                    <text class="member-role" v-if="member.teamRole">{{ getRoleDisplayName(member.teamRole) }}</text>
                  </view>
                  <view class="member-detail">
                    <text class="permission-level">{{ getPermissionLevelText(member.permissionLevel) }}</text>
                  </view>
                </view>
                <view class="member-actions">
                  <text class="action-btn edit" @click.stop="showEditMemberDialog(member)">编辑</text>
                  <text class="action-btn delete" @click.stop="confirmDeleteMember(member)">删除</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="create-team-footer">
          <button class="add-team-btn" @click="showCreateTeamDialog">
            创建新团队
          </button>
        </view>
      </view>
    </view>

    <!-- 创建团队弹窗 -->
    <uni-popup ref="createTeamPopup" type="center">
      <view class="dialog-container">
        <view class="dialog-header">
          <text class="dialog-title">创建团队</text>
          <text class="dialog-close" @click="closeCreateTeamDialog">×</text>
        </view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="label">团队名称 <text class="required">*</text></text>
            <input class="input" v-model="createTeamForm.teamName" placeholder="请输入团队名称" />
          </view>
          <view class="form-item">
            <text class="label">团队负责人 <text class="required">*</text></text>
            <view class="user-search">
              <input class="input" v-model="leaderSearchKeyword" placeholder="搜索用户作为负责人" @confirm="searchLeaderUsers" />
              <button class="search-btn" size="mini" @click="searchLeaderUsers">搜索</button>
            </view>
            <view class="user-list" v-if="leaderUsers.length > 0">
              <view
                class="user-item"
                v-for="user in leaderUsers"
                :key="user.id"
                :class="{ active: createTeamForm.teamLeaderId === user.id }"
                @click="selectLeader(user)"
              >
                <text class="user-name">{{ user.realName || user.userName || '未知' }}</text>
                <text class="user-selected" v-if="createTeamForm.teamLeaderId === user.id">✓</text>
              </view>
            </view>
            <view class="user-empty" v-else-if="leaderSearchKeyword && !leaderUsersLoading">
              <text>未找到用户</text>
            </view>
          </view>
          <view class="form-item">
            <text class="label">团队描述</text>
            <textarea class="textarea" v-model="createTeamForm.teamDescription" placeholder="请输入团队描述" :maxlength="200" />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="closeCreateTeamDialog">取消</button>
          <button class="dialog-btn confirm" @click="handleCreateTeam" :loading="createTeamLoading">
            创建
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 添加/编辑成员弹窗 -->
    <uni-popup ref="memberPopup" type="center">
      <view class="dialog-container">
        <view class="dialog-header">
          <text class="dialog-title">{{ memberDialogTitle }}</text>
          <text class="dialog-close" @click="closeMemberDialog">×</text>
        </view>
        <view class="dialog-content">
          <view class="form-item" v-if="!isEditingMember">
            <text class="label">选择用户 <text class="required">*</text></text>
            <view class="user-search">
              <input class="input" v-model="userSearchKeyword" placeholder="搜索用户" @confirm="searchUsers" />
              <button class="search-btn" size="mini" @click="searchUsers">搜索</button>
            </view>
            <view class="user-list" v-if="availableUsers.length > 0">
              <view class="user-item" v-for="user in availableUsers" :key="user.id">
                <checkbox :value="String(user.id)" :checked="memberForm.userId.includes(user.id)" @click="toggleUser(user.id)" />
                <text class="user-name">{{ user.realName || user.userName || '未知' }}</text>
              </view>
            </view>
            <view class="user-empty" v-else-if="userSearchKeyword && !usersLoading">
              <text>未找到用户</text>
            </view>
            <view class="selected-info" v-if="memberForm.userId.length > 0">
              <text>已选择 {{ memberForm.userId.length }} 人</text>
            </view>
          </view>
          <view class="form-item" v-else>
            <text class="label">用户</text>
            <view class="user-display">
              <text class="user-name">{{ currentEditingMember?.userRealName || currentEditingMember?.userName || '未知' }}</text>
            </view>
          </view>
          <view class="form-item">
            <text class="label">团队角色</text>
            <picker mode="selector" :range="teamRoles" range-key="roleName" @change="onRoleChange">
              <view class="picker-value">
                <text>{{ selectedRoleName || '请选择角色' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">权限级别</text>
            <picker mode="selector" :range="permissionLevels" range-key="label" @change="onPermissionChange">
              <view class="picker-value">
                <text>{{ selectedPermissionName || '请选择权限' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="closeMemberDialog">取消</button>
          <button class="dialog-btn confirm" @click="handleSaveMember" :loading="memberLoading">
            确定
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getWorkTeamListWithDetailsApi,
  getWorkTeamDetailWithMembersApi,
  createWorkTeamApi,
  addTeamMemberApi,
  updateTeamMemberApi,
  removeTeamMemberApi,
} from '@/api/work-team'
import type { WorkTeamApi } from '@/api/work-team'
import { getUserList } from '@/api/case'

const loading = ref(false)
const caseId = ref('')
const caseNo = ref('')
const teamList = ref<WorkTeamApi.WorkTeamInfo[]>([])
const expandedTeams = ref<Set<number>>(new Set())
const availableUsers = ref<any[]>([])
const leaderUsers = ref<any[]>([])
const userSearchKeyword = ref('')
const leaderSearchKeyword = ref('')
const usersLoading = ref(false)
const leaderUsersLoading = ref(false)
const createTeamLoading = ref(false)
const memberLoading = ref(false)
const memberDialogTitle = ref('添加成员')
const isEditingMember = ref(false)
const currentEditingMember = ref<any>(null)
const currentTeam = ref<any>(null)

const createTeamPopup = ref<any>(null)
const memberPopup = ref<any>(null)

const createTeamForm = ref({
  teamName: '',
  teamDescription: '',
  teamLeaderId: undefined as number | undefined,
})

const memberForm = ref({
  userId: [] as number[],
  teamRole: '',
  permissionLevel: 'VIEW' as WorkTeamApi.PermissionLevel,
})

const permissionLevels = [
  { label: '管理员', value: 'ADMIN' as WorkTeamApi.PermissionLevel },
  { label: '编辑', value: 'EDIT' as WorkTeamApi.PermissionLevel },
  { label: '查看', value: 'VIEW' as WorkTeamApi.PermissionLevel },
]

const teamRoles = ref<WorkTeamApi.TeamRoleInfo[]>([
  { id: 1, roleName: '团队负责人', roleCode: 'LEADER', status: 'ACTIVE', createTime: '' },
  { id: 2, roleName: '团队成员', roleCode: 'MEMBER', status: 'ACTIVE', createTime: '' },
])

// 角色英文代码到中文显示名的映射
const roleCodeToNameMap: Record<string, string> = {
  'LEADER': '团队负责人',
  'MEMBER': '团队成员',
  '团队负责人': '团队负责人',
  '团队成员': '团队成员',
}

const selectedRoleName = computed(() => {
  const role = teamRoles.value.find(r => r.roleName === memberForm.value.teamRole)
  return role?.roleName || ''
})

const selectedPermissionName = computed(() => {
  const level = permissionLevels.find(l => l.value === memberForm.value.permissionLevel)
  return level?.label || ''
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  caseId.value = currentPage.options?.id || ''
  if (caseId.value) {
    loadData()
  }

  uni.$on('refresh-work-team-list', () => loadData())
})

onUnmounted(() => {
  uni.$off('refresh-work-team-list')
})

onShow(() => {
  if (caseId.value) {
    loadData()
  }
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWorkTeamListWithDetailsApi({
      caseId: Number(caseId.value),
      pageNum: 1,
      pageSize: 100,
    })
    const list = res.data?.list || []
    list.forEach((team: any) => {
      team.members = team.members || []
    })
    teamList.value = list
    caseNo.value = teamList.value.length > 0 ? (teamList.value[0].caseNumber || caseId.value) : caseId.value
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const toggleTeamMembers = async (team: any) => {
  if (expandedTeams.value.has(team.id)) {
    expandedTeams.value.delete(team.id)
  } else {
    expandedTeams.value.add(team.id)
    if (!team.members) {
      await loadTeamMembers(team)
    }
  }
}

const loadTeamMembers = async (team: any) => {
  team.membersLoading = true
  try {
    const res = await getWorkTeamDetailWithMembersApi(team.id)
    team.members = res.data?.members || []
  } catch (error) {
    uni.showToast({ title: '加载成员失败', icon: 'none' })
    team.members = []
  } finally {
    team.membersLoading = false
  }
}

// 获取角色的中文显示名
const getRoleDisplayName = (role?: string) => {
  if (!role) return ''
  return roleCodeToNameMap[role] || role
}

// 搜索用户（用于添加成员）
const searchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await getUserList(userSearchKeyword.value, 1, 100)
    const users = res.data?.users || []
    // 过滤掉已经是当前团队成员的用户
    const existingMemberIds = new Set(currentTeam.value?.members?.map((m: any) => m.userId) || [])
    availableUsers.value = users.filter((u: any) => !existingMemberIds.has(u.id))
  } catch (error) {
uni.showToast({ title: '搜索用户失败', icon: 'none' })
    availableUsers.value = []
  } finally {
    usersLoading.value = false
  }
}

// 搜索负责人用户
const searchLeaderUsers = async () => {
  leaderUsersLoading.value = true
  try {
    const res = await getUserList(leaderSearchKeyword.value, 1, 100)
    leaderUsers.value = res.data?.users || []
  } catch (error) {
uni.showToast({ title: '搜索用户失败', icon: 'none' })
    leaderUsers.value = []
  } finally {
    leaderUsersLoading.value = false
  }
}

const selectLeader = (user: any) => {
  createTeamForm.value.teamLeaderId = user.id
}

const toggleUser = (userId: number) => {
  const index = memberForm.value.userId.indexOf(userId)
  if (index > -1) {
    memberForm.value.userId.splice(index, 1)
  } else {
    memberForm.value.userId.push(userId)
  }
}

const showCreateTeamDialog = () => {
  createTeamForm.value = {
    teamName: '',
    teamDescription: '',
    teamLeaderId: undefined,
  }
  leaderSearchKeyword.value = ''
  userSearchKeyword.value = ''
  leaderUsers.value = []
  availableUsers.value = []
  createTeamPopup.value?.open()
}

const closeCreateTeamDialog = () => {
  createTeamPopup.value?.close()
}

const handleCreateTeam = async () => {
  if (!createTeamForm.value.teamName.trim()) {
    uni.showToast({ title: '请输入团队名称', icon: 'none' })
    return
  }

  if (!createTeamForm.value.teamLeaderId) {
    uni.showToast({ title: '请选择团队负责人', icon: 'none' })
    return
  }

  createTeamLoading.value = true
  try {
    await createWorkTeamApi({
      teamName: createTeamForm.value.teamName.trim(),
      teamLeaderId: createTeamForm.value.teamLeaderId,
      caseId: Number(caseId.value),
      teamDescription: createTeamForm.value.teamDescription,
    })

    uni.showToast({ title: '创建成功', icon: 'success' })
    closeCreateTeamDialog()
    await loadData()
  } catch (error: any) {
    uni.showToast({ title: error.message || '创建失败', icon: 'none' })
  } finally {
    createTeamLoading.value = false
  }
}

const showAddMemberDialog = (team: any) => {
  currentTeam.value = team
  isEditingMember.value = false
  memberDialogTitle.value = '添加成员'
  memberForm.value = {
    userId: [],
    teamRole: '团队成员',
    permissionLevel: 'VIEW',
  }
  userSearchKeyword.value = ''
  availableUsers.value = []
  memberPopup.value?.open()
}

const showEditMemberDialog = (member: any) => {
  isEditingMember.value = true
  currentEditingMember.value = member
  memberDialogTitle.value = '编辑成员'
  memberForm.value = {
    userId: [member.userId],
    teamRole: getRoleDisplayName(member.teamRole) || '',
    permissionLevel: (member.permissionLevel as WorkTeamApi.PermissionLevel) || 'VIEW',
  }
  memberPopup.value?.open()
}

const closeMemberDialog = () => {
  memberPopup.value?.close()
}

const onRoleChange = (e: any) => {
  const index = Number(e.detail.value)
  if (teamRoles.value[index]) {
    memberForm.value.teamRole = teamRoles.value[index].roleName
  }
}

const onPermissionChange = (e: any) => {
  const index = Number(e.detail.value)
  if (permissionLevels[index]) {
    memberForm.value.permissionLevel = permissionLevels[index].value
  }
}

const handleSaveMember = async () => {
  if (!isEditingMember.value && memberForm.value.userId.length === 0) {
    uni.showToast({ title: '请选择用户', icon: 'none' })
    return
  }
  memberLoading.value = true
  try {
    if (isEditingMember.value) {
      await updateTeamMemberApi(currentEditingMember.value.id, {
        teamRole: memberForm.value.teamRole,
        permissionLevel: memberForm.value.permissionLevel,
      })
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await addTeamMemberApi(currentTeam.value.id, {
        caseId: Number(caseId.value),
        userId: memberForm.value.userId,
        teamRole: memberForm.value.teamRole || '团队成员',
        permissionLevel: memberForm.value.permissionLevel,
      })
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    closeMemberDialog()
    if (currentTeam.value) {
      await loadTeamMembers(currentTeam.value)
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || (isEditingMember.value ? '更新失败' : '添加失败'), icon: 'none' })
  } finally {
    memberLoading.value = false
  }
}

const confirmDeleteMember = (member: any) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除成员${member.userRealName || member.userName || '未知'}吗？`,
    success: async (res: UniApp.ShowModalRes) => {
      if (res.confirm) {
        await handleDeleteMember(member)
      }
    }
  })
}

const handleDeleteMember = async (member: any) => {
  try {
    await removeTeamMemberApi(member.id)
    uni.showToast({ title: '删除成功', icon: 'success' })
    const team = currentTeam.value || teamList.value.find((t: any) => t.id === member.teamId)
    if (team) {
      await loadTeamMembers(team)
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '删除失败', icon: 'none' })
  }
}

const getPermissionLevelText = (level?: string) => {
  const levelMap: Record<string, string> = {
    ADMIN: '管理员',
    EDIT: '编辑',
    VIEW: '查看',
  }
  return level ? (levelMap[level] || level) : '-'
}
</script>

<style lang="scss" scoped>
.work-team-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #0068E2;
  padding: 40rpx;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 12rpx;
  }

  .subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.content {
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-text {
    color: #999;
    font-size: 28rpx;
    margin-bottom: 30rpx;
  }

  .add-btn {
    margin-top: 20rpx;
    background: #0068E2;
    color: #fff;
  }
}

.team-list {
  .team-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      .team-header-left {
        display: flex;
        align-items: center;

        .team-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-right: 16rpx;
        }

        .member-count {
          font-size: 24rpx;
          color: #0068E2;
          background: rgba(0, 104, 226, 0.1);
          padding: 6rpx 16rpx;
          border-radius: 8rpx;
        }
      }

      .team-header-right {
        display: flex;
        align-items: center;

        .leader-name {
          font-size: 26rpx;
          color: #666;
          margin-right: 16rpx;
        }

        .expand-icon {
          font-size: 20rpx;
          color: #999;
        }
      }
    }

    .team-description {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20rpx;
    }

    .members-section {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;

      .members-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .members-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }

        .add-member-btn {
          margin: 0;
          background: #0068E2;
          color: #fff;
        }
      }

      .member-loading,
      .member-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40rpx 0;
        color: #999;
        font-size: 28rpx;
      }

      .member-list {
        .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20rpx;
          margin-bottom: 16rpx;
          background: #f9f9f9;
          border-radius: 12rpx;

          .member-info {
            flex: 1;

            .member-name-row {
              display: flex;
              align-items: center;
              margin-bottom: 8rpx;

              .member-name {
                font-size: 28rpx;
                color: #333;
                font-weight: bold;
                margin-right: 16rpx;
              }

              .member-role {
                font-size: 24rpx;
                color: #0068E2;
                background: rgba(0, 104, 226, 0.1);
                padding: 4rpx 12rpx;
                border-radius: 8rpx;
              }
            }

            .member-detail {
              .permission-level {
                font-size: 24rpx;
                color: #999;
              }
            }
          }

          .member-actions {
            display: flex;
            gap: 16rpx;

            .action-btn {
              font-size: 26rpx;
              padding: 8rpx 20rpx;
              border-radius: 8rpx;

              &.edit {
                color: #0068E2;
                background: rgba(0, 104, 226, 0.1);
              }

              &.delete {
                color: #ff4d4f;
                background: rgba(255, 77, 79, 0.1);
              }
            }
          }
        }
      }
    }
  }

  .create-team-footer {
    margin-top: 30rpx;

    .add-team-btn {
      width: 100%;
      background: #0068E2;
      color: #fff;
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

.dialog-container {
  width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .dialog-close {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
      padding: 0 10rpx;
    }
  }

  .dialog-content {
    padding: 30rpx;
    overflow-y: auto;
    flex: 1;

    .form-item {
      margin-bottom: 30rpx;

      .label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        display: block;

        .required {
          color: #ff4d4f;
        }
      }

      .input {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
      }

      .textarea {
        width: 100%;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        font-size: 28rpx;
        background: #fafafa;
        min-height: 120rpx;
      }

      .user-search {
        display: flex;
        gap: 16rpx;
        margin-bottom: 20rpx;

        .input {
          flex: 1;
        }

        .search-btn {
          margin: 0;
        }
      }

      .user-list {
        max-height: 300rpx;
        overflow-y: auto;
        border: 1rpx solid #f0f0f0;
        border-radius: 8rpx;
        padding: 8rpx 16rpx;

        .user-item {
          display: flex;
          align-items: center;
          padding: 16rpx 0;
          border-bottom: 1rpx solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          &.active {
            background: #e6f7ff;
            margin: 0 -16rpx;
            padding: 16rpx;
          }

          .user-name {
            font-size: 28rpx;
            color: #333;
            margin-left: 16rpx;
            flex: 1;
          }

          .user-selected {
            color: #0068E2;
            font-size: 28rpx;
            font-weight: bold;
          }
        }
      }

      .user-empty {
        text-align: center;
        color: #999;
        padding: 40rpx 0;
        font-size: 28rpx;
      }

      .selected-info {
        margin-top: 16rpx;
        font-size: 26rpx;
        color: #0068E2;
      }

      .user-display {
        padding: 20rpx;
        background: #f5f5f5;
        border-radius: 8rpx;

        .user-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        background: #fafafa;

        text {
          font-size: 28rpx;
          color: #333;
        }

        .picker-arrow {
          color: #999;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx 30rpx;
    flex-shrink: 0;

    .dialog-btn {
      flex: 1;
      margin: 0;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background: #0068E2;
        color: #fff;
      }
    }
  }
}
</style>
