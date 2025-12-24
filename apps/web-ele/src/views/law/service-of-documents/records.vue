<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ElMessage } from 'element-plus';

import { getServiceRecordListApi } from '#/api/core';
import { $t } from '#/locales';

const route = useRoute();
const id = route.params.id as string;

// 送达记录数据
const serviceRecords = ref<any[]>([]);
// 加载状态
const loading = ref(false);
// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

// 页面加载时获取数据
onMounted(() => {
  fetchServiceRecords();
});

// 获取送达记录
const fetchServiceRecords = async () => {
  loading.value = true;
  try {
    const response = await getServiceRecordListApi(id, {
      page: pagination.value.page,
      size: pagination.value.size,
    });
    serviceRecords.value = response.data.records.map((record: any) => ({
      ...record,
      // 确保兼容性，同时支持SEP_ID和id
      id: record.SEP_ID,
    }));
    pagination.value.total = response.data.count;
  } catch (error) {
    ElMessage.error('获取送达记录失败');
    console.error('获取送达记录失败:', error);
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (page: number, size: number) => {
  pagination.value.page = page;
  pagination.value.size = size;
  fetchServiceRecords();
};
</script>

<template>
  <div class="service-records p-5">
    <h1 class="mb-5 text-2xl font-bold">
      {{ $t('page.law.serviceOfDocuments') }} - 送达记录
    </h1>

    <!-- 返回按钮 -->
    <el-button type="primary" @click="$router.back()" class="mb-4">
      <el-icon><arrow-left /></el-icon>
      返回列表
    </el-button>

    <!-- 送达记录列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="text-lg font-semibold">送达记录</span>
          <span class="text-sm text-gray-500"
            >(共 {{ pagination.total }} 条)</span
          >
        </div>
      </template>
      <el-table
        :data="serviceRecords"
        stripe
        style="width: 100%"
        :loading="loading"
      >
        <el-table-column prop="id" label="记录ID" width="120" />
        <el-table-column prop="serviceMethod" label="送达方式" width="120">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.serviceMethod === '电子送达'
                  ? 'primary'
                  : scope.row.serviceMethod === '短信通知'
                    ? 'success'
                    : scope.row.serviceMethod === '邮寄送达'
                      ? 'warning'
                      : 'info'
              "
            >
              {{ scope.row.serviceMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceDate" label="送达时间" width="180" />
        <el-table-column prop="serviceResult" label="送达结果" width="120">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.serviceResult === '成功' ||
                scope.row.serviceResult === '已签收'
                  ? 'success'
                  : 'danger'
              "
            >
              {{ scope.row.serviceResult }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceContent" label="送达内容" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
      <!-- 分页组件 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handlePageChange"
          @current-change="(page) => handlePageChange(page, pagination.size)"
        />
      </div>
    </el-card>

    <!-- 送达统计信息 -->
    <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
      <el-card class="text-center">
        <div class="text-primary mb-1 text-2xl font-bold">
          {{ serviceRecords.length }}
        </div>
        <div class="text-sm text-gray-500">总送达次数</div>
      </el-card>
      <el-card class="text-center">
        <div class="text-success mb-1 text-2xl font-bold">
          {{
            serviceRecords.filter(
              (r) => r.serviceResult === '成功' || r.serviceResult === '已签收',
            ).length
          }}
        </div>
        <div class="text-sm text-gray-500">成功次数</div>
      </el-card>
      <el-card class="text-center">
        <div class="text-warning mb-1 text-2xl font-bold">
          {{
            serviceRecords.filter((r) => r.serviceResult === '待签收').length
          }}
        </div>
        <div class="text-sm text-gray-500">待签收次数</div>
      </el-card>
      <el-card class="text-center">
        <div class="text-danger mb-1 text-2xl font-bold">
          {{ serviceRecords.filter((r) => r.serviceResult === '失败').length }}
        </div>
        <div class="text-sm text-gray-500">失败次数</div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.service-records {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
