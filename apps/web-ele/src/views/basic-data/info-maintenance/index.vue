<script lang="ts" setup>
import type { CourtApi } from '#/api/core/court';
import type { DictionaryApi } from '#/api/core/dictionary';
import type { ManagerApi } from '#/api/core/manager';
import type { StaffApi } from '#/api/core/staff';
import type { SystemParamApi } from '#/api/core/system-param';
import type { FormInstance, FormRules } from 'element-plus';

import { onMounted, reactive, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElSwitch,
  ElTabPane,
  ElTabs,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  addCourtApi,
  deleteCourtApi,
  getCourtListApi,
  updateCourtApi,
} from '#/api/core/court';
import {
  addDictionaryCategoryApi,
  addDictionaryItemApi,
  deleteDictionaryCategoryApi,
  deleteDictionaryItemApi,
  getDictionaryCategoryListApi,
  getDictionaryItemListApi,
  updateDictionaryCategoryApi,
  updateDictionaryCategoryStatusApi,
  updateDictionaryItemApi,
  updateDictionaryItemStatusApi,
} from '#/api/core/dictionary';
import {
  addManagerApi,
  deleteManagerApi,
  getManagerListApi,
  getManagerListApi as getManagerListForStaffApi,
  updateManagerApi,
} from '#/api/core/manager';
import {
  createStaffApi,
  deleteStaffApi,
  getAvailableUsersApi,
  getStaffListApi,
} from '#/api/core/staff';
import {
  addSystemParamApi,
  deleteSystemParamApi,
  getSystemParamListApi,
  updateSystemParamApi,
  updateSystemParamStatusApi,
} from '#/api/core/system-param';

const activeTab = ref('court');

const formatDateTime = (timestamp: number | string | undefined) => {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  } catch {
    return '-';
  }
};

const statsCards = reactive({
  courtCount: 0,
  managerCount: 0,
  staffCount: 0,
  dictItemCount: 0,
});

const fetchStats = async () => {
  try {
    const [courtRes, managerRes] = await Promise.all([
      getCourtListApi({ pageNum: 1, pageSize: 1 }),
      getManagerListApi({ pageNum: 1, pageSize: 1 }),
    ]);
    if (courtRes.code === 200) statsCards.courtCount = courtRes.data.total || 0;
    if (managerRes.code === 200) statsCards.managerCount = managerRes.data.total || 0;
  } catch {
    // ignore
  }
};

// ==================== 法院信息 ====================
const courtList = ref<CourtApi.CourtInfo[]>([]);
const courtLoading = ref(false);
const courtSearchForm = reactive({ shortName: '', courtLevel: '' });
const courtPagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const courtLevelOptions = [
  { label: '最高人民法院', value: '最高人民法院' },
  { label: '高级人民法院', value: '高级人民法院' },
  { label: '中级人民法院', value: '中级人民法院' },
  { label: '基层人民法院', value: '基层人民法院' },
];

const fetchCourtList = async () => {
  courtLoading.value = true;
  try {
    const params: CourtApi.CourtQueryParams = {
      pageNum: courtPagination.page,
      pageSize: courtPagination.pageSize,
    };
    if (courtSearchForm.shortName) params.shortName = courtSearchForm.shortName;
    if (courtSearchForm.courtLevel) params.courtLevel = courtSearchForm.courtLevel;

    const response = await getCourtListApi(params);
    if (response.code === 200 && response.data) {
      courtList.value = (response.data.list || []).map((item: any) => ({
        ...item,
        fyqc: item.fullName,
        fyjc: item.shortName,
        fyjb: item.courtLevel,
        dz: item.address || '',
        lxdh: item.contactPhone,
        cbfg: item.undertakingJudge,
      }));
      courtPagination.itemCount = response.data.total || 0;
    } else {
      courtList.value = [];
      courtPagination.itemCount = 0;
    }
  } catch {
    courtList.value = [];
    courtPagination.itemCount = 0;
  } finally {
    courtLoading.value = false;
  }
};

const courtDialogVisible = ref(false);
const courtFormRef = ref<FormInstance>();
const courtFormLoading = ref(false);
const editingCourt = ref<CourtApi.CourtInfo | null>(null);
const courtFormData = reactive({
  fullName: '',
  shortName: '',
  courtLevel: '',
  address: '',
  contactPhone: '',
  undertakingJudge: '',
});
const courtRules: FormRules = {
  fullName: [{ required: true, message: '请输入法院全称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入法院简称', trigger: 'blur' }],
  courtLevel: [{ required: true, message: '请选择法院级别', trigger: 'change' }],
};

const handleAddCourt = () => {
  editingCourt.value = null;
  Object.assign(courtFormData, { fullName: '', shortName: '', courtLevel: '', address: '', contactPhone: '', undertakingJudge: '' });
  courtDialogVisible.value = true;
};

const handleEditCourt = (row: CourtApi.CourtInfo) => {
  editingCourt.value = row;
  Object.assign(courtFormData, {
    fullName: row.fullName || row.fyqc || '',
    shortName: row.shortName || row.fyjc || '',
    courtLevel: row.courtLevel || row.fyjb || '',
    address: row.address || row.dz || '',
    contactPhone: row.contactPhone || row.lxdh || '',
    undertakingJudge: row.undertakingJudge || row.cbfg || '',
  });
  courtDialogVisible.value = true;
};

const handleCourtSubmit = async () => {
  if (!courtFormRef.value) return;
  try {
    await courtFormRef.value.validate();
    courtFormLoading.value = true;
    const data = { ...courtFormData };

    if (editingCourt.value) {
      const res = await updateCourtApi(editingCourt.value.id, data);
      if (res.code === 200) { ElMessage.success('法院更新成功'); courtDialogVisible.value = false; fetchCourtList(); }
      else { ElMessage.error(res.message || '更新失败'); }
    } else {
      const res = await addCourtApi(data as any);
      if (res.code === 200) { ElMessage.success('法院添加成功'); courtDialogVisible.value = false; fetchCourtList(); fetchStats(); }
      else { ElMessage.error(res.message || '添加失败'); }
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') return;
    ElMessage.error('操作失败');
  } finally {
    courtFormLoading.value = false;
  }
};

const handleDeleteCourt = async (row: CourtApi.CourtInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该法院吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const res = await deleteCourtApi(row.id);
    if (res.code === 200) { ElMessage.success('删除成功'); fetchCourtList(); fetchStats(); }
    else { ElMessage.error(res.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  }
};

// ==================== 管理人信息 ====================
const managerList = ref<ManagerApi.ManagerInfo[]>([]);
const managerLoading = ref(false);
const managerSearchForm = reactive({ keyword: '' });
const managerPagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });

const fetchManagerList = async () => {
  managerLoading.value = true;
  try {
    const params: ManagerApi.ManagerQueryParams = {
      pageNum: managerPagination.page,
      pageSize: managerPagination.pageSize,
    };
    const response = await getManagerListApi(params);
    if (response.code === 200 && response.data) {
      managerList.value = response.data.list || [];
      managerPagination.itemCount = response.data.total || 0;
    } else {
      managerList.value = [];
      managerPagination.itemCount = 0;
    }
  } catch {
    managerList.value = [];
    managerPagination.itemCount = 0;
  } finally {
    managerLoading.value = false;
  }
};

const managerDialogVisible = ref(false);
const managerFormRef = ref<FormInstance>();
const managerFormLoading = ref(false);
const editingManager = ref<ManagerApi.ManagerInfo | null>(null);
const managerFormData = reactive({
  administratorName: '',
  contactPhone: '',
  contactEmail: '',
  officeAddress: '',
});
const managerRules: FormRules = {
  administratorName: [{ required: true, message: '请输入管理人名称', trigger: 'blur' }],
};

const handleAddManager = () => {
  editingManager.value = null;
  Object.assign(managerFormData, { administratorName: '', contactPhone: '', contactEmail: '', officeAddress: '' });
  managerDialogVisible.value = true;
};

const handleEditManager = (row: ManagerApi.ManagerInfo) => {
  editingManager.value = row;
  Object.assign(managerFormData, {
    administratorName: row.administratorName || '',
    contactPhone: row.contactPhone || '',
    contactEmail: row.contactEmail || '',
    officeAddress: row.officeAddress || '',
  });
  managerDialogVisible.value = true;
};

const handleManagerSubmit = async () => {
  if (!managerFormRef.value) return;
  try {
    await managerFormRef.value.validate();
    managerFormLoading.value = true;
    const data = { ...managerFormData };

    if (editingManager.value) {
      const res = await updateManagerApi(editingManager.value.id, data);
      if (res.code === 200) { ElMessage.success('管理人更新成功'); managerDialogVisible.value = false; fetchManagerList(); }
      else { ElMessage.error(res.message || '更新失败'); }
    } else {
      const res = await addManagerApi(data as any);
      if (res.code === 200) { ElMessage.success('管理人添加成功'); managerDialogVisible.value = false; fetchManagerList(); fetchStats(); }
      else { ElMessage.error(res.message || '添加失败'); }
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') return;
    ElMessage.error('操作失败');
  } finally {
    managerFormLoading.value = false;
  }
};

const handleDeleteManager = async (row: ManagerApi.ManagerInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理人吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const res = await deleteManagerApi(row.id);
    if (res.code === 200) { ElMessage.success('删除成功'); fetchManagerList(); fetchStats(); }
    else { ElMessage.error(res.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  }
};

// ==================== 员工信息 ====================
const staffManagerList = ref<ManagerApi.ManagerInfo[]>([]);
const staffSelectedManager = ref<ManagerApi.ManagerInfo | null>(null);
const staffList = ref<StaffApi.StaffInfo[]>([]);
const staffLoading = ref(false);
const staffManagerLoading = ref(false);
const staffManagerPagination = reactive({ page: 1, pageSize: 20, itemCount: 0 });

const fetchStaffManagerList = async () => {
  staffManagerLoading.value = true;
  try {
    const params: ManagerApi.ManagerQueryParams = {
      pageNum: staffManagerPagination.page,
      pageSize: staffManagerPagination.pageSize,
    };
    const response = await getManagerListForStaffApi(params);
    if (response.code === 200 && response.data) {
      staffManagerList.value = response.data.list || [];
      staffManagerPagination.itemCount = response.data.total || 0;
    } else {
      staffManagerList.value = [];
    }
  } catch {
    staffManagerList.value = [];
  } finally {
    staffManagerLoading.value = false;
  }
};

const fetchStaffList = async () => {
  if (!staffSelectedManager.value) { staffList.value = []; return; }
  staffLoading.value = true;
  try {
    const response = await getStaffListApi(staffSelectedManager.value.id);
    if (response.code === 200 && response.data) {
      staffList.value = response.data;
      statsCards.staffCount = response.data.length;
    } else {
      staffList.value = [];
    }
  } catch {
    staffList.value = [];
  } finally {
    staffLoading.value = false;
  }
};

const handleStaffManagerClick = (manager: ManagerApi.ManagerInfo) => {
  staffSelectedManager.value = manager;
  fetchStaffList();
};

const staffDialogVisible = ref(false);
const availableUsers = ref<StaffApi.AvailableUser[]>([]);
const availableUsersLoading = ref(false);
const selectedUserId = ref<number | undefined>(undefined);

const openAddStaffDialog = async () => {
  if (!staffSelectedManager.value) { ElMessage.warning('请先选择管理人'); return; }
  selectedUserId.value = undefined;
  availableUsersLoading.value = true;
  staffDialogVisible.value = true;
  try {
    const response = await getAvailableUsersApi(staffSelectedManager.value.id);
    if (response.code === 200 && response.data) availableUsers.value = response.data;
    else availableUsers.value = [];
  } catch {
    availableUsers.value = [];
  } finally {
    availableUsersLoading.value = false;
  }
};

const handleAddStaff = async () => {
  if (!staffSelectedManager.value || !selectedUserId.value) { ElMessage.warning('请选择用户'); return; }
  try {
    staffLoading.value = true;
    const response = await createStaffApi(staffSelectedManager.value.id, { userId: selectedUserId.value });
    if (response.code === 200) { ElMessage.success('新增成功'); staffDialogVisible.value = false; fetchStaffList(); fetchStats(); }
    else { ElMessage.error(response.message || '新增失败'); }
  } catch {
    ElMessage.error('新增失败');
  } finally {
    staffLoading.value = false;
  }
};

const handleDeleteStaff = async (staff: StaffApi.StaffInfo) => {
  if (!staffSelectedManager.value) return;
  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    staffLoading.value = true;
    const response = await deleteStaffApi(staffSelectedManager.value.id, staff.id);
    if (response.code === 200) { ElMessage.success('删除成功'); fetchStaffList(); fetchStats(); }
    else { ElMessage.error(response.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  } finally {
    staffLoading.value = false;
  }
};

// ==================== 数据字典 ====================
const dictCategoryList = ref<DictionaryApi.DictionaryCategory[]>([]);
const dictCategoryLoading = ref(false);
const dictSelectedCategory = ref<DictionaryApi.DictionaryCategory | null>(null);
const dictItemList = ref<DictionaryApi.DictionaryItem[]>([]);
const dictItemLoading = ref(false);
const dictCategorySearchForm = reactive({ keyword: '', status: '' });
const dictCategoryPagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const dictItemPagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });

const fetchDictCategoryList = async () => {
  dictCategoryLoading.value = true;
  try {
    const params: DictionaryApi.DictionaryQueryParams = {
      pageNum: dictCategoryPagination.page,
      pageSize: dictCategoryPagination.pageSize,
    };
    if (dictCategorySearchForm.keyword) params.keyword = dictCategorySearchForm.keyword;
    if (dictCategorySearchForm.status) params.status = dictCategorySearchForm.status;

    const response = await getDictionaryCategoryListApi(params);
    if (response.code === 200 && response.data) {
      dictCategoryList.value = response.data.list || [];
      dictCategoryPagination.itemCount = response.data.total || 0;
    } else {
      dictCategoryList.value = [];
      dictCategoryPagination.itemCount = 0;
    }
  } catch {
    dictCategoryList.value = [];
    dictCategoryPagination.itemCount = 0;
  } finally {
    dictCategoryLoading.value = false;
  }
};

const fetchDictItemList = async () => {
  if (!dictSelectedCategory.value) { dictItemList.value = []; return; }
  dictItemLoading.value = true;
  try {
    const params: DictionaryApi.DictionaryItemQueryParams = {
      pageNum: dictItemPagination.page,
      pageSize: dictItemPagination.pageSize,
      categoryId: dictSelectedCategory.value.id,
    };
    const response = await getDictionaryItemListApi(params);
    if (response.code === 200 && response.data) {
      dictItemList.value = response.data.list || [];
      dictItemPagination.itemCount = response.data.total || 0;
      statsCards.dictItemCount = response.data.total || 0;
    } else {
      dictItemList.value = [];
      dictItemPagination.itemCount = 0;
    }
  } catch {
    dictItemList.value = [];
    dictItemPagination.itemCount = 0;
  } finally {
    dictItemLoading.value = false;
  }
};

const handleDictCategoryClick = (category: DictionaryApi.DictionaryCategory) => {
  dictSelectedCategory.value = category;
  dictItemPagination.page = 1;
  fetchDictItemList();
};

const handleToggleCategoryStatus = async (row: DictionaryApi.DictionaryCategory) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const res = await updateDictionaryCategoryStatusApi(row.id, { status: newStatus });
    if (res.code === 200) {
      ElMessage.success(newStatus === 'ACTIVE' ? '已启用' : '已停用');
      fetchDictCategoryList();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch {
    ElMessage.error('操作失败');
  }
};

const handleToggleItemStatus = async (row: DictionaryApi.DictionaryItem) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const res = await updateDictionaryItemStatusApi(row.id, { status: newStatus });
    if (res.code === 200) {
      ElMessage.success(newStatus === 'ACTIVE' ? '已启用' : '已停用');
      fetchDictItemList();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch {
    ElMessage.error('操作失败');
  }
};

const dictCategoryDialogVisible = ref(false);
const dictCategoryFormRef = ref<FormInstance>();
const dictCategoryFormLoading = ref(false);
const editingDictCategory = ref<DictionaryApi.DictionaryCategory | null>(null);
const dictCategoryFormData = reactive({
  categoryCode: '',
  categoryName: '',
  description: '',
  sortOrder: 0,
  status: 'ACTIVE',
});
const dictCategoryRules: FormRules = {
  categoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

const handleAddDictCategory = () => {
  editingDictCategory.value = null;
  Object.assign(dictCategoryFormData, { categoryCode: '', categoryName: '', description: '', sortOrder: 0, status: 'ACTIVE' });
  dictCategoryDialogVisible.value = true;
};

const handleEditDictCategory = (row: DictionaryApi.DictionaryCategory) => {
  editingDictCategory.value = row;
  Object.assign(dictCategoryFormData, {
    categoryCode: row.categoryCode || '',
    categoryName: row.categoryName || '',
    description: row.description || '',
    sortOrder: row.sortOrder || 0,
    status: row.status || 'ACTIVE',
  });
  dictCategoryDialogVisible.value = true;
};

const handleDictCategorySubmit = async () => {
  if (!dictCategoryFormRef.value) return;
  try {
    await dictCategoryFormRef.value.validate();
    dictCategoryFormLoading.value = true;
    const data = { ...dictCategoryFormData };

    if (editingDictCategory.value) {
      const res = await updateDictionaryCategoryApi(editingDictCategory.value.id, data);
      if (res.code === 200) { ElMessage.success('分类更新成功'); dictCategoryDialogVisible.value = false; fetchDictCategoryList(); }
      else { ElMessage.error(res.message || '更新失败'); }
    } else {
      const res = await addDictionaryCategoryApi(data);
      if (res.code === 200) { ElMessage.success('分类添加成功'); dictCategoryDialogVisible.value = false; fetchDictCategoryList(); }
      else { ElMessage.error(res.message || '添加失败'); }
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') return;
    ElMessage.error('操作失败');
  } finally {
    dictCategoryFormLoading.value = false;
  }
};

const handleDeleteDictCategory = async (row: DictionaryApi.DictionaryCategory) => {
  try {
    await ElMessageBox.confirm('删除分类将同时删除其下所有字典项，确定删除吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const res = await deleteDictionaryCategoryApi(row.id);
    if (res.code === 200) { ElMessage.success('删除成功'); fetchDictCategoryList(); if (dictSelectedCategory.value?.id === row.id) { dictSelectedCategory.value = null; dictItemList.value = []; } }
    else { ElMessage.error(res.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  }
};

const dictItemDialogVisible = ref(false);
const dictItemFormRef = ref<FormInstance>();
const dictItemFormLoading = ref(false);
const editingDictItem = ref<DictionaryApi.DictionaryItem | null>(null);
const dictItemFormData = reactive({
  itemCode: '',
  itemName: '',
  itemValue: '',
  description: '',
  sortOrder: 0,
  status: 'ACTIVE',
});
const dictItemRules: FormRules = {
  itemCode: [{ required: true, message: '请输入字典项编码', trigger: 'blur' }],
  itemName: [{ required: true, message: '请输入字典项名称', trigger: 'blur' }],
  itemValue: [{ required: true, message: '请输入字典项值', trigger: 'blur' }],
};

const handleAddDictItem = () => {
  if (!dictSelectedCategory.value) { ElMessage.warning('请先选择字典分类'); return; }
  editingDictItem.value = null;
  Object.assign(dictItemFormData, {
    itemCode: '', itemName: '', itemValue: '', description: '', sortOrder: 0, status: 'ACTIVE',
  });
  dictItemDialogVisible.value = true;
};

const handleEditDictItem = (row: DictionaryApi.DictionaryItem) => {
  editingDictItem.value = row;
  Object.assign(dictItemFormData, {
    itemCode: row.itemCode || '',
    itemName: row.itemName || '',
    itemValue: row.itemValue || '',
    description: row.description || '',
    sortOrder: row.sortOrder || 0,
    status: row.status || 'ACTIVE',
  });
  dictItemDialogVisible.value = true;
};

const handleDictItemSubmit = async () => {
  if (!dictItemFormRef.value) return;
  try {
    await dictItemFormRef.value.validate();
    dictItemFormLoading.value = true;
    const data = { ...dictItemFormData };

    if (editingDictItem.value) {
      const res = await updateDictionaryItemApi(editingDictItem.value.id, data);
      if (res.code === 200) { ElMessage.success('字典项更新成功'); dictItemDialogVisible.value = false; fetchDictItemList(); }
      else { ElMessage.error(res.message || '更新失败'); }
    } else {
      const res = await addDictionaryItemApi(dictSelectedCategory.value!.id, data);
      if (res.code === 200) { ElMessage.success('字典项添加成功'); dictItemDialogVisible.value = false; fetchDictItemList(); }
      else { ElMessage.error(res.message || '添加失败'); }
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') return;
    ElMessage.error('操作失败');
  } finally {
    dictItemFormLoading.value = false;
  }
};

const handleDeleteDictItem = async (row: DictionaryApi.DictionaryItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典项吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const res = await deleteDictionaryItemApi(row.id);
    if (res.code === 200) { ElMessage.success('删除成功'); fetchDictItemList(); }
    else { ElMessage.error(res.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  }
};

// ==================== 系统参数 ====================
const systemParamList = ref<SystemParamApi.SystemParam[]>([]);
const systemParamLoading = ref(false);
const systemParamSearchForm = reactive({ configGroup: '', status: '' });
const systemParamPagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const paramGroupOptions = [
  { label: '基础配置', value: 'BASIC' },
  { label: '案件管理', value: 'CASE' },
  { label: '费用管理', value: 'EXPENSE' },
  { label: '审批流程', value: 'APPROVAL' },
  { label: '文档管理', value: 'DOCUMENT' },
  { label: '系统通用', value: 'SYSTEM' },
];

const getGroupLabel = (group: string) => {
  const found = paramGroupOptions.find(o => o.value === group);
  return found ? found.label : group;
};

const fetchSystemParamList = async () => {
  systemParamLoading.value = true;
  try {
    const params: SystemParamApi.SystemParamQueryParams = {
      pageNum: systemParamPagination.page,
      pageSize: systemParamPagination.pageSize,
    };
    if (systemParamSearchForm.configGroup) params.configGroup = systemParamSearchForm.configGroup;
    if (systemParamSearchForm.status) params.status = systemParamSearchForm.status;

    const response = await getSystemParamListApi(params);
    if (response.code === 200 && response.data) {
      systemParamList.value = response.data.list || [];
      systemParamPagination.itemCount = response.data.total || 0;
    } else {
      systemParamList.value = [];
      systemParamPagination.itemCount = 0;
    }
  } catch {
    systemParamList.value = [];
    systemParamPagination.itemCount = 0;
  } finally {
    systemParamLoading.value = false;
  }
};

const handleToggleParamStatus = async (row: SystemParamApi.SystemParam) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    const res = await updateSystemParamStatusApi(row.id, { status: newStatus });
    if (res.code === 200) {
      ElMessage.success(newStatus === 'ACTIVE' ? '已启用' : '已停用');
      fetchSystemParamList();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch {
    ElMessage.error('操作失败');
  }
};

const systemParamDialogVisible = ref(false);
const systemParamFormRef = ref<FormInstance>();
const systemParamFormLoading = ref(false);
const editingSystemParam = ref<SystemParamApi.SystemParam | null>(null);
const systemParamFormData = reactive({
  configKey: '',
  configValue: '',
  configDesc: '',
  configGroup: '',
  sortOrder: 0,
  status: 'ACTIVE',
});
const systemParamRules: FormRules = {
  configKey: [{ required: true, message: '请输入参数键', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
  configGroup: [{ required: true, message: '请选择参数分组', trigger: 'change' }],
};

const handleAddSystemParam = () => {
  editingSystemParam.value = null;
  Object.assign(systemParamFormData, { configKey: '', configValue: '', configDesc: '', configGroup: '', sortOrder: 0, status: 'ACTIVE' });
  systemParamDialogVisible.value = true;
};

const handleEditSystemParam = (row: SystemParamApi.SystemParam) => {
  editingSystemParam.value = row;
  Object.assign(systemParamFormData, {
    configKey: row.configKey || '',
    configValue: row.configValue || '',
    configDesc: row.configDesc || '',
    configGroup: row.configGroup || '',
    sortOrder: row.sortOrder || 0,
    status: row.status || 'ACTIVE',
  });
  systemParamDialogVisible.value = true;
};

const handleSystemParamSubmit = async () => {
  if (!systemParamFormRef.value) return;
  try {
    await systemParamFormRef.value.validate();
    systemParamFormLoading.value = true;
    const data = { ...systemParamFormData };

    if (editingSystemParam.value) {
      const res = await updateSystemParamApi(editingSystemParam.value.configKey, data);
      if (res.code === 200) { ElMessage.success('参数更新成功'); systemParamDialogVisible.value = false; fetchSystemParamList(); }
      else { ElMessage.error(res.message || '更新失败'); }
    } else {
      const res = await addSystemParamApi(data);
      if (res.code === 200) { ElMessage.success('参数添加成功'); systemParamDialogVisible.value = false; fetchSystemParamList(); }
      else { ElMessage.error(res.message || '添加失败'); }
    }
  } catch (error: any) {
    if (error.name === 'ElValidationError') return;
    ElMessage.error('操作失败');
  } finally {
    systemParamFormLoading.value = false;
  }
};

const handleDeleteSystemParam = async (row: SystemParamApi.SystemParam) => {
  try {
    await ElMessageBox.confirm('确定要删除该参数吗？', '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const res = await deleteSystemParamApi(row.id);
    if (res.code === 200) { ElMessage.success('删除成功'); fetchSystemParamList(); }
    else { ElMessage.error(res.message || '删除失败'); }
  } catch (error: any) {
    if (error.name !== 'ElMessageBoxCancel') ElMessage.error('删除失败');
  }
};

const getStatusType = (status: string) => {
  return status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'info' : 'warning';
};

const getStatusText = (status: string) => {
  return status === 'ACTIVE' ? '启用' : status === 'INACTIVE' ? '停用' : status;
};

const handleTabChange = (tab: string) => {
  if (tab === 'court' && courtList.value.length === 0) fetchCourtList();
  else if (tab === 'manager' && managerList.value.length === 0) fetchManagerList();
  else if (tab === 'staff' && staffManagerList.value.length === 0) { fetchStaffManagerList(); }
  else if (tab === 'dictionary' && dictCategoryList.value.length === 0) fetchDictCategoryList();
  else if (tab === 'systemParam' && systemParamList.value.length === 0) fetchSystemParamList();
};

onMounted(() => {
  fetchStats();
  fetchCourtList();
});
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center gap-6 text-sm text-gray-500">
      <span class="text-base font-semibold text-gray-800">基础信息维护</span>
      <span>法院 <b class="text-gray-800">{{ statsCards.courtCount }}</b></span>
      <span>管理人 <b class="text-gray-800">{{ statsCards.managerCount }}</b></span>
      <span>员工 <b class="text-gray-800">{{ statsCards.staffCount }}</b></span>
      <span>字典项 <b class="text-gray-800">{{ statsCards.dictItemCount }}</b></span>
    </div>

    <ElCard>
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- ==================== 法院信息 ==================== -->
        <ElTabPane label="法院信息" name="court">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex flex-wrap gap-3">
              <ElInput v-model="courtSearchForm.shortName" placeholder="法院简称" clearable style="width: 180px" @keyup.enter="courtPagination.page = 1; fetchCourtList()" />
              <ElSelect v-model="courtSearchForm.courtLevel" placeholder="法院级别" clearable style="width: 180px" @change="courtPagination.page = 1; fetchCourtList()">
                <ElOption v-for="opt in courtLevelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </ElSelect>
              <ElButton type="primary" @click="courtPagination.page = 1; fetchCourtList()"><i class="i-lucide-search mr-1"></i>搜索</ElButton>
              <ElButton @click="courtSearchForm.shortName = ''; courtSearchForm.courtLevel = ''; courtPagination.page = 1; fetchCourtList()"><i class="i-lucide-refresh-cw mr-1"></i>重置</ElButton>
            </div>
            <div class="flex gap-2">
              <ElButton type="primary" @click="handleAddCourt"><i class="i-lucide-plus mr-1"></i>新增法院</ElButton>
              <ElButton @click="courtPagination.page = 1; fetchCourtList()"><i class="i-lucide-refresh-cw mr-1"></i>刷新</ElButton>
            </div>
          </div>

          <ElTable v-loading="courtLoading" :data="courtList" :border="true" :stripe="true" style="width: 100%">
            <ElTableColumn type="index" label="序号" width="60" align="center" />
            <ElTableColumn prop="fyqc" label="法院全称" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="fyjc" label="法院简称" width="120" align="center" />
            <ElTableColumn prop="fyjb" label="法院级别" width="140" align="center" />
            <ElTableColumn prop="dz" label="地址" min-width="200" show-overflow-tooltip />
            <ElTableColumn prop="lxdh" label="联系电话" width="130" align="center" />
            <ElTableColumn prop="cbfg" label="承办法官" width="120" align="center" />
            <ElTableColumn label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <ElButton size="small" text class="text-primary" @click="handleEditCourt(row)"><i class="i-lucide-edit mr-1"></i>编辑</ElButton>
                <ElButton size="small" text class="text-danger" @click="handleDeleteCourt(row)"><i class="i-lucide-trash-2 mr-1"></i>删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElPagination v-model:current-page="courtPagination.page" v-model:page-size="courtPagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="courtPagination.itemCount" layout="total, sizes, prev, pager, next, jumper" @size-change="(s: number) => { courtPagination.pageSize = s; courtPagination.page = 1; fetchCourtList(); }" @current-change="(p: number) => { courtPagination.page = p; fetchCourtList(); }" />
          </div>
        </ElTabPane>

        <!-- ==================== 管理人信息 ==================== -->
        <ElTabPane label="管理人信息" name="manager">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex flex-wrap gap-3">
              <ElInput v-model="managerSearchForm.keyword" placeholder="管理人名称" clearable style="width: 200px" @keyup.enter="managerPagination.page = 1; fetchManagerList()" />
              <ElButton type="primary" @click="managerPagination.page = 1; fetchManagerList()"><i class="i-lucide-search mr-1"></i>搜索</ElButton>
              <ElButton @click="managerSearchForm.keyword = ''; managerPagination.page = 1; fetchManagerList()"><i class="i-lucide-refresh-cw mr-1"></i>重置</ElButton>
            </div>
            <div class="flex gap-2">
              <ElButton type="primary" @click="handleAddManager"><i class="i-lucide-plus mr-1"></i>新增管理人</ElButton>
              <ElButton @click="managerPagination.page = 1; fetchManagerList()"><i class="i-lucide-refresh-cw mr-1"></i>刷新</ElButton>
            </div>
          </div>

          <ElTable v-loading="managerLoading" :data="managerList" :border="true" :stripe="true" style="width: 100%">
            <ElTableColumn type="index" label="序号" width="60" align="center" />
            <ElTableColumn prop="administratorName" label="管理人名称" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="contactPhone" label="联系电话" width="130" align="center" />
            <ElTableColumn prop="contactEmail" label="联系邮箱" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="officeAddress" label="办公地址" min-width="200" show-overflow-tooltip />
            <ElTableColumn prop="createTime" label="创建时间" width="160" align="center">
              <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <ElButton size="small" text class="text-primary" @click="handleEditManager(row)"><i class="i-lucide-edit mr-1"></i>编辑</ElButton>
                <ElButton size="small" text class="text-danger" @click="handleDeleteManager(row)"><i class="i-lucide-trash-2 mr-1"></i>删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElPagination v-model:current-page="managerPagination.page" v-model:page-size="managerPagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="managerPagination.itemCount" layout="total, sizes, prev, pager, next, jumper" @size-change="(s: number) => { managerPagination.pageSize = s; managerPagination.page = 1; fetchManagerList(); }" @current-change="(p: number) => { managerPagination.page = p; fetchManagerList(); }" />
          </div>
        </ElTabPane>

        <!-- ==================== 员工信息 ==================== -->
        <ElTabPane label="员工信息" name="staff">
          <ElRow :gutter="16">
            <ElCol :span="6">
              <div class="mb-2 font-semibold">管理人列表</div>
              <ElTable v-loading="staffManagerLoading" :data="staffManagerList" :style="{ width: '100%' }" :height="500" highlight-current-row @current-change="handleStaffManagerClick">
                <ElTableColumn prop="administratorName" label="管理人名称" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="flex items-center gap-2">
                      <span>{{ row.administratorName }}</span>
                      <ElTag v-if="staffSelectedManager?.id === row.id" type="success" size="small">已选中</ElTag>
                    </div>
                  </template>
                </ElTableColumn>
              </ElTable>
              <div class="mt-3 flex justify-center">
                <ElPagination v-model:current-page="staffManagerPagination.page" v-model:page-size="staffManagerPagination.pageSize" :total="staffManagerPagination.itemCount" :page-sizes="[10, 20, 50]" layout="prev, pager, next" size="small" @size-change="(s: number) => { staffManagerPagination.pageSize = s; staffManagerPagination.page = 1; fetchStaffManagerList(); }" @current-change="(p: number) => { staffManagerPagination.page = p; fetchStaffManagerList(); }" />
              </div>
            </ElCol>
            <ElCol :span="18">
              <div class="mb-2 flex items-center justify-between">
                <span class="font-semibold">{{ staffSelectedManager ? `${staffSelectedManager.administratorName} - 员工列表` : '员工列表' }}</span>
                <ElButton type="primary" :disabled="!staffSelectedManager" @click="openAddStaffDialog"><i class="i-lucide-plus mr-1"></i>新增员工</ElButton>
              </div>
              <div v-if="!staffSelectedManager" class="flex items-center justify-center text-gray-400" style="height: 400px">请在左侧选择管理人</div>
              <ElTable v-else v-loading="staffLoading" :data="staffList" :border="true" :stripe="true" style="width: 100%" :height="500">
                <ElTableColumn type="index" label="序号" width="80" align="center" />
                <ElTableColumn prop="name" label="姓名" min-width="150" align="center" />
                <ElTableColumn prop="contactPhone" label="手机号" min-width="150" align="center" />
                <ElTableColumn prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <ElTag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createTime" label="创建时间" width="160" align="center">
                  <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="100" align="center" fixed="right">
                  <template #default="{ row }">
                    <ElButton size="small" text type="danger" @click="handleDeleteStaff(row)"><i class="i-lucide-trash-2 mr-1"></i>删除</ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>
            </ElCol>
          </ElRow>
        </ElTabPane>

        <!-- ==================== 数据字典 ==================== -->
        <ElTabPane label="数据字典" name="dictionary">
          <ElRow :gutter="16">
            <ElCol :span="8">
              <div class="mb-2 flex items-center justify-between">
                <span class="font-semibold">字典分类</span>
                <ElButton type="primary" size="small" @click="handleAddDictCategory"><i class="i-lucide-plus mr-1"></i>新增分类</ElButton>
              </div>
              <div class="mb-3 flex gap-2">
                <ElInput v-model="dictCategorySearchForm.keyword" placeholder="搜索关键词" clearable size="small" @keyup.enter="dictCategoryPagination.page = 1; fetchDictCategoryList()" />
                <ElSelect v-model="dictCategorySearchForm.status" placeholder="状态" clearable size="small" style="width: 100px" @change="dictCategoryPagination.page = 1; fetchDictCategoryList()">
                  <ElOption label="启用" value="ACTIVE" />
                  <ElOption label="停用" value="INACTIVE" />
                </ElSelect>
                <ElButton type="primary" size="small" @click="dictCategoryPagination.page = 1; fetchDictCategoryList()"><i class="i-lucide-search"></i></ElButton>
              </div>
              <ElTable v-loading="dictCategoryLoading" :data="dictCategoryList" :style="{ width: '100%' }" :height="500" highlight-current-row @current-change="handleDictCategoryClick">
                <ElTableColumn prop="categoryName" label="分类名称" min-width="100" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="flex items-center gap-2">
                      <span>{{ row.categoryName }}</span>
                      <ElTag v-if="dictSelectedCategory?.id === row.id" type="success" size="small">已选中</ElTag>
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="categoryCode" label="编码" width="110" align="center" />
                <ElTableColumn prop="status" label="状态" width="80" align="center">
                  <template #default="{ row }">
                    <ElTag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="200" align="center">
                  <template #default="{ row }">
                    <div class="flex items-center justify-center gap-2">
                      <ElSwitch :model-value="row.status === 'ACTIVE'" size="small" @change="handleToggleCategoryStatus(row)" />
                      <ElButton size="small" text type="primary" @click.stop="handleEditDictCategory(row)"><i class="i-lucide-edit"></i>编辑</ElButton>
                      <ElButton size="small" text type="danger" @click.stop="handleDeleteDictCategory(row)"><i class="i-lucide-trash-2"></i>删除</ElButton>
                      <!-- DEBUG: Check if buttons render -->
                      <span style="color: red; font-size: 12px;">DEBUG: {{ row.categoryName }}</span>
                    </div>
                  </template>
                </ElTableColumn>
              </ElTable>
              <div class="mt-3 flex justify-center">
                <ElPagination v-model:current-page="dictCategoryPagination.page" v-model:page-size="dictCategoryPagination.pageSize" :total="dictCategoryPagination.itemCount" :page-sizes="[10, 20, 50]" layout="prev, pager, next" size="small" @size-change="(s: number) => { dictCategoryPagination.pageSize = s; dictCategoryPagination.page = 1; fetchDictCategoryList(); }" @current-change="(p: number) => { dictCategoryPagination.page = p; fetchDictCategoryList(); }" />
              </div>
            </ElCol>
            <ElCol :span="16">
              <div class="mb-2 flex items-center justify-between">
                <span class="font-semibold">{{ dictSelectedCategory ? `${dictSelectedCategory.categoryName} - 字典项` : '字典项列表' }}</span>
                <ElButton type="primary" size="small" :disabled="!dictSelectedCategory" @click="handleAddDictItem"><i class="i-lucide-plus mr-1"></i>新增字典项</ElButton>
              </div>
              <div v-if="!dictSelectedCategory" class="flex items-center justify-center text-gray-400" style="height: 400px">请在左侧选择字典分类</div>
              <template v-else>
                <ElTable v-loading="dictItemLoading" :data="dictItemList" :border="true" :stripe="true" style="width: 100%" :height="500">
                  <ElTableColumn type="index" label="序号" width="60" align="center" />
                  <ElTableColumn prop="itemCode" label="项编码" width="120" align="center" />
                  <ElTableColumn prop="itemName" label="项名称" min-width="130" show-overflow-tooltip />
                  <ElTableColumn prop="itemValue" label="项值" min-width="130" show-overflow-tooltip />
                  <ElTableColumn prop="sortOrder" label="排序" width="70" align="center" />
                  <ElTableColumn prop="status" label="状态" width="80" align="center">
                    <template #default="{ row }">
                      <ElTag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</ElTag>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="操作" width="180" align="center" fixed="right">
                    <template #default="{ row }">
                      <ElSwitch :model-value="row.status === 'ACTIVE'" size="small" @change="handleToggleItemStatus(row)" />
                      <ElButton size="small" text type="primary" @click="handleEditDictItem(row)"><i class="i-lucide-edit"></i></ElButton>
                      <ElButton size="small" text type="danger" @click="handleDeleteDictItem(row)"><i class="i-lucide-trash-2"></i></ElButton>
                    </template>
                  </ElTableColumn>
                </ElTable>
                <div class="mt-3 flex justify-end">
                  <ElPagination v-model:current-page="dictItemPagination.page" v-model:page-size="dictItemPagination.pageSize" :total="dictItemPagination.itemCount" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" size="small" @size-change="(s: number) => { dictItemPagination.pageSize = s; dictItemPagination.page = 1; fetchDictItemList(); }" @current-change="(p: number) => { dictItemPagination.page = p; fetchDictItemList(); }" />
                </div>
              </template>
            </ElCol>
          </ElRow>
        </ElTabPane>

        <!-- ==================== 系统参数 ==================== -->
        <ElTabPane label="系统参数" name="systemParam">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex flex-wrap gap-3">
              <ElSelect v-model="systemParamSearchForm.configGroup" placeholder="参数分组" clearable style="width: 180px" @change="systemParamPagination.page = 1; fetchSystemParamList()">
                <ElOption v-for="opt in paramGroupOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </ElSelect>
              <ElSelect v-model="systemParamSearchForm.status" placeholder="状态" clearable style="width: 120px" @change="systemParamPagination.page = 1; fetchSystemParamList()">
                <ElOption label="启用" value="ACTIVE" />
                <ElOption label="停用" value="INACTIVE" />
              </ElSelect>
              <ElButton type="primary" @click="systemParamPagination.page = 1; fetchSystemParamList()"><i class="i-lucide-search mr-1"></i>搜索</ElButton>
              <ElButton @click="systemParamSearchForm.configGroup = ''; systemParamSearchForm.status = ''; systemParamPagination.page = 1; fetchSystemParamList()"><i class="i-lucide-refresh-cw mr-1"></i>重置</ElButton>
            </div>
            <div class="flex gap-2">
              <ElButton type="primary" @click="handleAddSystemParam"><i class="i-lucide-plus mr-1"></i>新增参数</ElButton>
              <ElButton @click="systemParamPagination.page = 1; fetchSystemParamList()"><i class="i-lucide-refresh-cw mr-1"></i>刷新</ElButton>
            </div>
          </div>

          <ElTable v-loading="systemParamLoading" :data="systemParamList" :border="true" :stripe="true" style="width: 100%">
            <ElTableColumn type="index" label="序号" width="60" align="center" />
            <ElTableColumn prop="configKey" label="参数键" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="param-key">{{ row.configKey }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="configValue" label="参数值" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="param-value">{{ row.configValue }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="configDesc" label="说明" min-width="160" show-overflow-tooltip />
            <ElTableColumn prop="configGroup" label="参数分组" width="120" align="center">
              <template #default="{ row }">
                <ElTag size="small" :type="row.configGroup === 'BASIC' ? 'primary' : row.configGroup === 'SYSTEM' ? 'info' : row.configGroup === 'CASE' ? 'warning' : 'success'">{{ getGroupLabel(row.configGroup) }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="sortOrder" label="排序" width="70" align="center" />
            <ElTableColumn prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElSwitch :model-value="row.status === 'ACTIVE'" size="small" @change="handleToggleParamStatus(row)" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="更新时间" width="160" align="center">
              <template #default="{ row }">{{ formatDateTime(row.updateTime) }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <ElButton size="small" text class="text-primary" @click="handleEditSystemParam(row)"><i class="i-lucide-edit mr-1"></i>编辑</ElButton>
                <ElButton size="small" text class="text-danger" @click="handleDeleteSystemParam(row)"><i class="i-lucide-trash-2 mr-1"></i>删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="mt-4 flex justify-end">
            <ElPagination v-model:current-page="systemParamPagination.page" v-model:page-size="systemParamPagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="systemParamPagination.itemCount" layout="total, sizes, prev, pager, next, jumper" @size-change="(s: number) => { systemParamPagination.pageSize = s; systemParamPagination.page = 1; fetchSystemParamList(); }" @current-change="(p: number) => { systemParamPagination.page = p; fetchSystemParamList(); }" />
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- ==================== 法院新增/编辑弹窗 ==================== -->
    <ElDialog v-model="courtDialogVisible" :title="editingCourt ? '编辑法院' : '新增法院'" width="550px" destroy-on-close>
      <ElForm ref="courtFormRef" :model="courtFormData" :rules="courtRules" label-width="100px">
        <ElFormItem label="法院全称" prop="fullName">
          <ElInput v-model="courtFormData.fullName" placeholder="请输入法院全称" />
        </ElFormItem>
        <ElFormItem label="法院简称" prop="shortName">
          <ElInput v-model="courtFormData.shortName" placeholder="请输入法院简称" />
        </ElFormItem>
        <ElFormItem label="法院级别" prop="courtLevel">
          <ElSelect v-model="courtFormData.courtLevel" placeholder="请选择法院级别" style="width: 100%">
            <ElOption v-for="opt in courtLevelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="地址">
          <ElInput v-model="courtFormData.address" placeholder="请输入地址" />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="courtFormData.contactPhone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="承办法官">
          <ElInput v-model="courtFormData.undertakingJudge" placeholder="请输入承办法官" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="courtDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="courtFormLoading" @click="handleCourtSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 管理人新增/编辑弹窗 ==================== -->
    <ElDialog v-model="managerDialogVisible" :title="editingManager ? '编辑管理人' : '新增管理人'" width="550px" destroy-on-close>
      <ElForm ref="managerFormRef" :model="managerFormData" :rules="managerRules" label-width="100px">
        <ElFormItem label="管理人名称" prop="administratorName">
          <ElInput v-model="managerFormData.administratorName" placeholder="请输入管理人名称" />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="managerFormData.contactPhone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="联系邮箱">
          <ElInput v-model="managerFormData.contactEmail" placeholder="请输入联系邮箱" />
        </ElFormItem>
        <ElFormItem label="办公地址">
          <ElInput v-model="managerFormData.officeAddress" placeholder="请输入办公地址" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="managerDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="managerFormLoading" @click="handleManagerSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 员工新增弹窗 ==================== -->
    <ElDialog v-model="staffDialogVisible" title="新增员工" width="450px" destroy-on-close>
      <div class="mb-3 text-sm text-gray-500">选择要添加的员工：</div>
      <ElSelect v-model="selectedUserId" placeholder="请选择用户" :loading="availableUsersLoading" filterable style="width: 100%">
        <ElOption v-for="user in availableUsers" :key="user.id" :label="`${user.realName} (${user.mobile})`" :value="user.id">
          <div class="flex justify-between w-full">
            <span>{{ user.realName }}</span>
            <span class="text-gray-400 text-sm">{{ user.mobile }}</span>
          </div>
        </ElOption>
      </ElSelect>
      <template #footer>
        <ElButton @click="staffDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!selectedUserId" @click="handleAddStaff">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 字典分类新增/编辑弹窗 ==================== -->
    <ElDialog v-model="dictCategoryDialogVisible" :title="editingDictCategory ? '编辑字典分类' : '新增字典分类'" width="500px" destroy-on-close>
      <ElForm ref="dictCategoryFormRef" :model="dictCategoryFormData" :rules="dictCategoryRules" label-width="100px">
        <ElFormItem label="分类编码" prop="categoryCode">
          <ElInput v-model="dictCategoryFormData.categoryCode" placeholder="请输入分类编码（如 CASE_STATUS）" :disabled="!!editingDictCategory" />
        </ElFormItem>
        <ElFormItem label="分类名称" prop="categoryName">
          <ElInput v-model="dictCategoryFormData.categoryName" placeholder="请输入分类名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="dictCategoryFormData.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
        </ElFormItem>
        <ElFormItem label="排序号">
          <ElInput v-model.number="dictCategoryFormData.sortOrder" type="number" placeholder="请输入排序号" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="dictCategoryFormData.status" style="width: 100%">
            <ElOption label="启用" value="ACTIVE" />
            <ElOption label="停用" value="INACTIVE" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dictCategoryDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="dictCategoryFormLoading" @click="handleDictCategorySubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 字典项新增/编辑弹窗 ==================== -->
    <ElDialog v-model="dictItemDialogVisible" :title="editingDictItem ? '编辑字典项' : '新增字典项'" width="550px" destroy-on-close>
      <ElForm ref="dictItemFormRef" :model="dictItemFormData" :rules="dictItemRules" label-width="100px">
        <ElFormItem label="项编码" prop="itemCode">
          <ElInput v-model="dictItemFormData.itemCode" placeholder="请输入字典项编码（如 PENDING）" :disabled="!!editingDictItem" />
        </ElFormItem>
        <ElFormItem label="项名称" prop="itemName">
          <ElInput v-model="dictItemFormData.itemName" placeholder="请输入字典项名称（如 待处理）" />
        </ElFormItem>
        <ElFormItem label="项值" prop="itemValue">
          <ElInput v-model="dictItemFormData.itemValue" placeholder="请输入字典项值" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="dictItemFormData.description" type="textarea" :rows="2" placeholder="请输入字典项描述" />
        </ElFormItem>
        <ElFormItem label="排序号">
          <ElInput v-model.number="dictItemFormData.sortOrder" type="number" placeholder="请输入排序号" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="dictItemFormData.status" style="width: 100%">
            <ElOption label="启用" value="ACTIVE" />
            <ElOption label="停用" value="INACTIVE" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dictItemDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="dictItemFormLoading" @click="handleDictItemSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 系统参数新增/编辑弹窗 ==================== -->
    <ElDialog v-model="systemParamDialogVisible" :title="editingSystemParam ? '编辑系统参数' : '新增系统参数'" width="550px" destroy-on-close>
      <ElForm ref="systemParamFormRef" :model="systemParamFormData" :rules="systemParamRules" label-width="100px">
        <ElFormItem label="参数键" prop="configKey">
          <ElInput v-model="systemParamFormData.configKey" placeholder="请输入参数键（如 system.name）" :disabled="!!editingSystemParam" />
        </ElFormItem>
        <ElFormItem label="参数值" prop="configValue">
          <ElInput v-model="systemParamFormData.configValue" placeholder="请输入参数值" />
        </ElFormItem>
        <ElFormItem label="参数分组" prop="configGroup">
          <ElSelect v-model="systemParamFormData.configGroup" placeholder="请选择参数分组" style="width: 100%">
            <ElOption v-for="opt in paramGroupOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="说明">
          <ElInput v-model="systemParamFormData.configDesc" type="textarea" :rows="3" placeholder="请输入参数说明" />
        </ElFormItem>
        <ElFormItem label="排序号">
          <ElInput v-model.number="systemParamFormData.sortOrder" type="number" placeholder="请输入排序号" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="systemParamFormData.status" style="width: 100%">
            <ElOption label="启用" value="ACTIVE" />
            <ElOption label="停用" value="INACTIVE" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="systemParamDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="systemParamFormLoading" @click="handleSystemParamSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.text-primary {
  color: var(--el-color-primary);
}

.text-danger {
  color: var(--el-color-danger);
}

.param-key {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #c41d7f;
  background: #fff0f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.param-value {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #0969da;
  background: #ddf4ff;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
