<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage, ElMessageBox } from 'element-plus';

import ChatLayout from '../components/ChatLayout.vue';
import { useContactStore } from '../stores/contact';

const router = useRouter();
const contactStore = useContactStore();

// 状态
const selectedContacts = ref<number[]>([]);
const showAddGroupDialog = ref(false);
const newGroupName = ref('');

// 从store中解构状态和方法
const { 
  contacts, 
  groups, 
  filteredContacts, 
  searchKeyword, 
  selectedGroup, 
  loading, 
  fetchContacts, 
  fetchContactGroups,
  deleteContact,
  addGroup,
  setSelectedGroup 
} = contactStore;

// 方法
function handleAddContact() {
  router.push('/chat/contacts/add');
}

function handleEditContact(contactId: number) {
  router.push(`/chat/contacts/edit/${contactId}`);
}

function handleDeleteContact(contactId: number) {
  // 调用store中的删除方法
  ElMessageBox.confirm('确定要删除该联系人吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteContact(contactId);
      ElMessage.success('联系人删除成功');
    })
    .catch(() => {
      // 取消删除
    });
}

function handleGroupClick(groupId: number) {
  setSelectedGroup(groupId === selectedGroup ? null : groupId);
}

function handleAddGroup() {
  if (!newGroupName.value.trim()) {
    ElMessage.warning('请输入分组名称');
    return;
  }

  // 调用store中的添加分组方法
  addGroup({
    id: groups.length + 1,
    name: newGroupName.value.trim(),
    sortOrder: groups.length + 1,
    userId: Number(localStorage.getItem('chat_user_id') || '0'),
    createdAt: new Date().toISOString()
  });
  newGroupName.value = '';
  showAddGroupDialog.value = false;
  ElMessage.success('分组添加成功');
}

function handleChatWithContact(contactId: number) {
  router.push(`/chat/contact/${contactId}`);
}

function handleContactSelectionChange(selection: any[]) {
  selectedContacts.value = selection.map((item) => item.id);
}

function handleBatchDelete() {
  if (selectedContacts.value.length === 0) {
    ElMessage.warning('请选择要删除的联系人');
    return;
  }

  ElMessageBox.confirm(
    `确定要删除选中的${selectedContacts.value.length}个联系人吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      // 实际项目中这里应该调用API批量删除联系人
      selectedContacts.value.forEach(id => deleteContact(id));
      selectedContacts.value = [];
      ElMessage.success('联系人批量删除成功');
    })
    .catch(() => {
      // 取消删除
    });
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchContacts();
  fetchContactGroups();
});
</script>

<template>
  <ChatLayout>
    <!-- 联系人管理页面 -->
    <div class="contact-management-container">
      <!-- 顶部操作栏 -->
      <header class="management-header">
        <div class="header-left">
          <h2>联系人管理</h2>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索联系人"
            prefix-icon="el-icon-search"
            style="width: 300px; margin-right: 16px"
          />
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleAddContact"
          >
            新增联系人
          </el-button>
          <el-dropdown>
            <el-button type="default" icon="el-icon-more"> 更多操作 </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click="handleBatchDelete"
                  :disabled="selectedContacts.length === 0"
                >
                  批量删除 ({{ selectedContacts.length }})
                </el-dropdown-item>
                <el-dropdown-item @click="showAddGroupDialog = true">
                  新建分组
                </el-dropdown-item>
                <el-dropdown-item> 导入联系人 </el-dropdown-item>
                <el-dropdown-item> 导出联系人 </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="management-main">
        <!-- 左侧分组列表 -->
        <aside class="group-list">
          <div class="group-header">
            <h3>联系人分组</h3>
            <el-button
              type="text"
              icon="el-icon-plus"
              size="small"
              @click="showAddGroupDialog = true"
            >
              新建
            </el-button>
          </div>
          <div class="group-items">
            <div
              class="group-item"
              :class="{ active: selectedGroup === null }"
              @click="setSelectedGroup(null)"
            >
              <span class="group-name">全部联系人</span>
              <span class="group-count">{{ contacts.length }}</span>
            </div>
            <div
              v-for="group in groups"
              :key="group.id"
              class="group-item"
              :class="{ active: selectedGroup === group.id }"
              @click="handleGroupClick(group.id)"
            >
              <span class="group-name">{{ group.name }}</span>
              <span class="group-count">{{ contacts.filter(c => c.groupId === group.id).length }}</span>
            </div>
          </div>
        </aside>

        <!-- 右侧联系人列表 -->
        <section class="contact-list">
          <el-table
            :data="filteredContacts"
            style="width: 100%"
            @selection-change="handleContactSelectionChange"
            v-loading="loading"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="avatar" label="头像" width="80">
              <template #default="scope">
                <el-avatar :src="scope.row.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" min-width="120">
              <template #default="scope">
                <div class="contact-name">
                  {{ scope.row.name }}
                  <el-tag v-if="scope.row.isOnline" type="success" size="small">
                    在线
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="电话" min-width="150" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column prop="groupId" label="分组" min-width="100">
              <template #default="scope">
                {{ 
                  groups.find((g) => g.id === scope.row.groupId)?.name ||
                  '默认分组'
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-chat-dot-round"
                  @click="handleChatWithContact(scope.row.id)"
                >
                  聊天
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-edit"
                  @click="handleEditContact(scope.row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-delete"
                  @click="handleDeleteContact(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </main>

      <!-- 添加分组对话框 -->
      <el-dialog v-model="showAddGroupDialog" title="添加分组" width="400px">
        <el-form>
          <el-form-item label="分组名称" required>
            <el-input v-model="newGroupName" placeholder="请输入分组名称" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddGroupDialog = false">取消</el-button>
            <el-button type="primary" @click="handleAddGroup">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </ChatLayout>
</template>

<style scoped>
.contact-management-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

/* 顶部操作栏样式 */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.management-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主内容区样式 */
.management-main {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* 分组列表样式 */
.group-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.group-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.group-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 0 8px;
}

.group-item:hover {
  background-color: #f5f7fa;
}

.group-item.active {
  background-color: #ecf5ff;
  color: #408aed;
}

.group-name {
  flex: 1;
  font-size: 14px;
}

.group-count {
  font-size: 12px;
  opacity: 0.6;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
}

.group-item.active .group-count {
  background-color: rgba(64, 138, 237, 0.1);
}

/* 联系人列表样式 */
.contact-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contact-list :deep(.el-table) {
  border: none;
}

.contact-list :deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

.contact-list :deep(.el-table__header-wrapper th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.contact-list :deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

.contact-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 滚动条样式 */
.group-items::-webkit-scrollbar,
.contact-list :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
}

.group-items::-webkit-scrollbar-track,
.contact-list :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
}

.group-items::-webkit-scrollbar-thumb,
.contact-list :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

.group-items::-webkit-scrollbar-thumb:hover,
.contact-list :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}
</style>
