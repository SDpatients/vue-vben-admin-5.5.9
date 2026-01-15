<script setup lang="ts">
import { computed, ref } from 'vue';

import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElEmpty,
  ElMessage,
  ElPagination,
  ElPopconfirm,
  ElRow,
  ElSkeleton,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import {
  getEquipmentListApi,
  getEstateListApi,
  getIntellectualPropertyListApi,
  getInventoryListApi,
  getPropertyListApi,
  getVehicleListApi,
} from '#/api/core/asset';

interface Props {
  caseId: string;
  caseName: string;
}

const props = defineProps<Props>();

const activeTab = ref('property');
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const propertyList = ref<any[]>([]);
const estateList = ref<any[]>([]);
const vehicleList = ref<any[]>([]);
const equipmentList = ref<any[]>([]);
const inventoryList = ref<any[]>([]);
const ipList = ref<any[]>([]);

const tabs = [
  { key: 'property', label: '财产管理', icon: 'lucide:landmark' },
  { key: 'estate', label: '房产管理', icon: 'lucide:home' },
  { key: 'vehicle', label: '车辆管理', icon: 'lucide:car' },
  { key: 'equipment', label: '设备管理', icon: 'lucide:settings' },
  { key: 'inventory', label: '存货管理', icon: 'lucide:package' },
  { key: 'ip', label: '知识产权管理', icon: 'lucide:copyright' },
];

const currentList = computed(() => {
  switch (activeTab.value) {
    case 'equipment': {
      return equipmentList.value;
    }
    case 'estate': {
      return estateList.value;
    }
    case 'inventory': {
      return inventoryList.value;
    }
    case 'ip': {
      return ipList.value;
    }
    case 'property': {
      return propertyList.value;
    }
    case 'vehicle': {
      return vehicleList.value;
    }
    default: {
      return [];
    }
  }
});

const fetchPropertyList = async () => {
  loading.value = true;
  try {
    const response = await getPropertyListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      propertyList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取财产列表失败:', error);
    ElMessage.error('获取财产列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchEstateList = async () => {
  loading.value = true;
  try {
    const response = await getEstateListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      estateList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取房产列表失败:', error);
    ElMessage.error('获取房产列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchVehicleList = async () => {
  loading.value = true;
  try {
    const response = await getVehicleListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      vehicleList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取车辆列表失败:', error);
    ElMessage.error('获取车辆列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchEquipmentList = async () => {
  loading.value = true;
  try {
    const response = await getEquipmentListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      equipmentList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchInventoryList = async () => {
  loading.value = true;
  try {
    const response = await getInventoryListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      inventoryList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取存货列表失败:', error);
    ElMessage.error('获取存货列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchIntellectualPropertyList = async () => {
  loading.value = true;
  try {
    const response = await getIntellectualPropertyListApi({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      caseId: Number(props.caseId),
    });
    if (response.code === 200 && response.data) {
      ipList.value = response.data.list || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取知识产权列表失败:', error);
    ElMessage.error('获取知识产权列表失败');
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  currentPage.value = 1;
  switch (tab) {
    case 'equipment': {
      fetchEquipmentList();
      break;
    }
    case 'estate': {
      fetchEstateList();
      break;
    }
    case 'inventory': {
      fetchInventoryList();
      break;
    }
    case 'ip': {
      fetchIntellectualPropertyList();
      break;
    }
    case 'property': {
      fetchPropertyList();
      break;
    }
    case 'vehicle': {
      fetchVehicleList();
      break;
    }
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  handleTabChange(activeTab.value);
};

const getPropertyTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    REAL_ESTATE: '房产',
    VEHICLE: '车辆',
    EQUIPMENT: '设备',
    INVENTORY: '存货',
    INTELLECTUAL_PROPERTY: '知识产权',
    OTHER: '其他',
  };
  return labels[type] || type;
};

const getPropertyStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    NORMAL: '正常',
    DAMAGED: '损坏',
    LOST: '丢失',
    DISPOSED: '已处置',
    EXPIRED: '已过期',
    INVALID: '无效',
    TRANSFERRED: '已转让',
  };
  return labels[status] || status;
};

const getPropertyStatusType = (status: string) => {
  const types: Record<string, any> = {
    NORMAL: 'success',
    DAMAGED: 'warning',
    LOST: 'danger',
    DISPOSED: 'info',
    EXPIRED: 'danger',
    INVALID: 'danger',
    TRANSFERRED: 'info',
  };
  return types[status] || '';
};

const getManagementStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: '待管理',
    MANAGED: '管理中',
    DISPOSED: '已处置',
  };
  return labels[status] || status;
};

const getManagementStatusType = (status: string) => {
  const types: Record<string, any> = {
    PENDING: 'warning',
    MANAGED: 'success',
    DISPOSED: 'info',
  };
  return types[status] || '';
};

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const handleViewDetail = (row: any) => {
  ElMessage.info('查看详情功能待实现');
};

const handleEdit = (row: any) => {
  ElMessage.info('编辑功能待实现');
};

const handleDelete = async (row: any) => {
  ElMessage.info('删除功能待实现');
};

const handleAdd = () => {
  ElMessage.info('新增功能待实现');
};
</script>

<template>
  <div class="asset-management-container">
    <ElRow :gutter="16" class="mb-4">
      <ElCol v-for="tab in tabs" :key="tab.key" :span="4">
        <ElCard
          class="asset-tab-card"
          :class="[{ active: activeTab === tab.key }]"
          shadow="hover"
          @click="handleTabChange(tab.key)"
        >
          <div class="tab-content">
            <Icon :icon="tab.icon" class="tab-icon" />
            <div class="tab-label">{{ tab.label }}</div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <Icon
              :icon="tabs.find((t) => t.key === activeTab)?.icon"
              class="mr-2"
            />
            {{ tabs.find((t) => t.key === activeTab)?.label }}
          </div>
          <ElButton type="primary" @click="handleAdd">
            <Icon icon="lucide:plus" class="mr-1" />
            新增
          </ElButton>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <ElSkeleton :rows="5" animated />
      </div>

      <div v-else-if="currentList.length === 0" class="empty-container">
        <ElEmpty description="暂无数据" />
      </div>

      <div v-else>
        <ElTable :data="currentList" stripe border>
          <ElTableColumn type="index" label="序号" width="60" align="center" />

          <ElTableColumn
            v-if="activeTab === 'property'"
            prop="propertyNo"
            label="财产编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'property'"
            prop="propertyName"
            label="财产名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'property'"
            label="财产类型"
            min-width="120"
          >
            <template #default="{ row }">
              {{ getPropertyTypeLabel(row.propertyType) }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            v-if="activeTab === 'estate'"
            prop="estateNo"
            label="房产编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'estate'"
            prop="estateName"
            label="房产名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'estate'"
            prop="estateAddress"
            label="房产地址"
            min-width="200"
          />

          <ElTableColumn
            v-if="activeTab === 'vehicle'"
            prop="vehicleNo"
            label="车辆编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'vehicle'"
            prop="vehicleName"
            label="车辆名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'vehicle'"
            prop="licensePlate"
            label="车牌号"
            min-width="120"
          />

          <ElTableColumn
            v-if="activeTab === 'equipment'"
            prop="equipmentNo"
            label="设备编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'equipment'"
            prop="equipmentName"
            label="设备名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'equipment'"
            prop="quantity"
            label="数量"
            min-width="80"
            align="center"
          />

          <ElTableColumn
            v-if="activeTab === 'inventory'"
            prop="inventoryNo"
            label="存货编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'inventory'"
            prop="inventoryName"
            label="存货名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'inventory'"
            prop="quantity"
            label="数量"
            min-width="100"
            align="center"
          />

          <ElTableColumn
            v-if="activeTab === 'ip'"
            prop="ipNo"
            label="知识产权编号"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'ip'"
            prop="ipName"
            label="知识产权名称"
            min-width="150"
          />
          <ElTableColumn
            v-if="activeTab === 'ip'"
            prop="registrationNo"
            label="登记号"
            min-width="150"
          />

          <ElTableColumn
            v-if="activeTab !== 'inventory'"
            label="当前价值"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              {{ formatCurrency(row.currentValue) }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            v-if="activeTab === 'inventory'"
            label="总价值"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              {{ formatCurrency(row.totalValue) }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="资产状态" min-width="100" align="center">
            <template #default="{ row }">
              <ElTag
                :type="
                  getPropertyStatusType(
                    row.propertyStatus ||
                      row.estateStatus ||
                      row.vehicleStatus ||
                      row.equipmentStatus ||
                      row.inventoryStatus ||
                      row.ipStatus,
                  )
                "
              >
                {{
                  getPropertyStatusLabel(
                    row.propertyStatus ||
                      row.estateStatus ||
                      row.vehicleStatus ||
                      row.equipmentStatus ||
                      row.inventoryStatus ||
                      row.ipStatus,
                  )
                }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="管理状态" min-width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="getManagementStatusType(row.managementStatus)">
                {{ getManagementStatusLabel(row.managementStatus) }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="创建时间" min-width="150">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton
                type="primary"
                link
                size="small"
                @click="handleViewDetail(row)"
              >
                查看
              </ElButton>
              <ElButton
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </ElButton>
              <ElPopconfirm
                title="确定要删除这条记录吗？"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <ElButton type="danger" link size="small"> 删除 </ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="pagination-container mt-4">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handlePageChange"
          />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.asset-management-container {
  min-height: 600px;
}

.asset-tab-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.asset-tab-card:hover {
  transform: translateY(-2px);
}

.asset-tab-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
}

.tab-icon {
  font-size: 32px;
  color: #606266;
  margin-bottom: 8px;
}

.asset-tab-card.active .tab-icon {
  color: #409eff;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.asset-tab-card.active .tab-label {
  color: #409eff;
}

.table-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>
