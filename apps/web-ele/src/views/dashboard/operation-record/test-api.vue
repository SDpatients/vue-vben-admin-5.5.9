<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  ElAlert,
  ElButton,
  ElCard,
  ElMessage,
  ElSpace,
  ElTag,
} from 'element-plus';

const router = useRouter();
const testResults = ref<any[]>([]);

// 跳转到操作记录页面
const goToOperationRecord = () => {
  router.push('/dashboard/operation-record');
};

// 模拟GET请求
const simulateGetRequest = async () => {
  try {
    // 使用项目中的请求客户端
    const { requestClient } = await import('../../../api/request');

    await requestClient.get('/api/test/get');

    testResults.value.unshift({
      method: 'GET',
      url: '/api/test/get',
      success: true,
      message: 'GET请求模拟成功，应该会在操作记录中显示',
    });

    ElMessage.success('GET请求模拟成功');
  } catch (error) {
    testResults.value.unshift({
      method: 'GET',
      url: '/api/test/get',
      success: false,
      message: `GET请求失败：${(error as Error).message}`,
    });

    ElMessage.error('GET请求模拟失败');
  }
};

// 模拟POST请求
const simulatePostRequest = async () => {
  try {
    const { requestClient } = await import('../../../api/request');

    await requestClient.post('/api/test/post', {
      test: 'data',
    });

    testResults.value.unshift({
      method: 'POST',
      url: '/api/test/post',
      success: true,
      message: 'POST请求模拟成功，应该会在操作记录中显示',
    });

    ElMessage.success('POST请求模拟成功');
  } catch (error) {
    testResults.value.unshift({
      method: 'POST',
      url: '/api/test/post',
      success: false,
      message: `POST请求失败：${(error as Error).message}`,
    });

    ElMessage.error('POST请求模拟失败');
  }
};

// 模拟PUT请求
const simulatePutRequest = async () => {
  try {
    const { requestClient } = await import('../../../api/request');

    await requestClient.put('/api/test/put/1', {
      update: 'data',
    });

    testResults.value.unshift({
      method: 'PUT',
      url: '/api/test/put/1',
      success: true,
      message: 'PUT请求模拟成功，应该会在操作记录中显示',
    });

    ElMessage.success('PUT请求模拟成功');
  } catch (error) {
    testResults.value.unshift({
      method: 'PUT',
      url: '/api/test/put/1',
      success: false,
      message: `PUT请求失败：${(error as Error).message}`,
    });

    ElMessage.error('PUT请求模拟失败');
  }
};

// 模拟DELETE请求
const simulateDeleteRequest = async () => {
  try {
    const { requestClient } = await import('../../../api/request');

    await requestClient.delete('/api/test/delete/1');

    testResults.value.unshift({
      method: 'DELETE',
      url: '/api/test/delete/1',
      success: true,
      message: 'DELETE请求模拟成功，应该会在操作记录中显示',
    });

    ElMessage.success('DELETE请求模拟成功');
  } catch (error) {
    testResults.value.unshift({
      method: 'DELETE',
      url: '/api/test/delete/1',
      success: false,
      message: `DELETE请求失败：${(error as Error).message}`,
    });

    ElMessage.error('DELETE请求模拟失败');
  }
};
</script>

<template>
  <div class="p-5">
    <ElCard header="API跟踪功能测试" size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <span>API跟踪功能测试</span>
          <ElButton type="primary" @click="goToOperationRecord">
            <i class="i-lucide-clock mr-1"></i>
            查看操作记录
          </ElButton>
        </div>
      </template>

      <ElSpace direction="vertical" size="large" class="w-full">
        <ElAlert type="info" title="测试说明" show-icon>
          点击下面的按钮来模拟各种API请求，然后查看操作记录页面是否能够正确跟踪这些请求。
        </ElAlert>

        <ElCard header="模拟API请求" size="small">
          <ElSpace>
            <ElButton type="primary" @click="simulateGetRequest">
              模拟GET请求
            </ElButton>
            <ElButton type="success" @click="simulatePostRequest">
              模拟POST请求
            </ElButton>
            <ElButton type="warning" @click="simulatePutRequest">
              模拟PUT请求
            </ElButton>
            <ElButton type="danger" @click="simulateDeleteRequest">
              模拟DELETE请求
            </ElButton>
          </ElSpace>
        </ElCard>

        <ElCard header="测试结果" size="small">
          <div
            v-if="testResults.length === 0"
            class="py-8 text-center text-gray-400"
          >
            <i class="i-lucide-test-tube mb-2 text-4xl"></i>
            <div>暂无测试结果</div>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(result, index) in testResults"
              :key="index"
              class="rounded border p-3"
              :class="{
                'border-green-200 bg-green-50': result.success,
                'border-red-200 bg-red-50': !result.success,
              }"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium">
                  {{ result.method }} {{ result.url }}
                </span>
                <ElTag :type="result.success ? 'success' : 'danger'">
                  {{ result.success ? '成功' : '失败' }}
                </ElTag>
              </div>
              <div class="mt-1 text-sm text-gray-600">{{ result.message }}</div>
            </div>
          </div>
        </ElCard>
      </ElSpace>
    </ElCard>
  </div>
</template>
