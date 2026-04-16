import type { LicenseApi } from '#/api/core/license';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import {
  getLicenseStatusApi,
  getMachineCodeApi,
  uploadLicenseApi,
} from '#/api/core/license';

export const useLicenseStore = defineStore('license', () => {
  const licenseStatus = ref<LicenseApi.LicenseStatus | null>(null);
  const machineCode = ref<string>('');
  const loading = ref(false);
  const licenseChecked = ref(false);

  async function fetchLicenseStatus() {
    try {
      loading.value = true;
      const result = await getLicenseStatusApi();
      // baseRequestClient 返回完整响应，需要提取 data 字段
      if (result && result.code === 200 && result.data) {
        licenseStatus.value = result.data;
      }
      licenseChecked.value = true;
      return licenseStatus.value;
    } catch (error) {
      console.error('获取许可证状态失败:', error);
      licenseStatus.value = null;
      licenseChecked.value = true;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMachineCode() {
    try {
      console.log('LicenseStore: 开始获取机器码...');
      const result = await getMachineCodeApi();
      console.log('LicenseStore: 机器码 API 响应:', result);
      // baseRequestClient 返回完整响应，需要提取 data 字段
      if (result && result.code === 200 && result.data) {
        machineCode.value = result.data.machineCode || '';
        console.log('LicenseStore: 机器码获取成功:', machineCode.value);
      } else {
        console.warn('LicenseStore: 机器码 API 返回异常:', result);
        machineCode.value = '';
      }
      return machineCode.value;
    } catch (error) {
      console.error('LicenseStore: 获取机器码失败:', error);
      machineCode.value = '';
      return '';
    }
  }

  async function uploadLicense(file: File) {
    try {
      loading.value = true;
      const result = await uploadLicenseApi(file);
      // fileUploadRequestClient 返回完整响应
      if (result && result.code === 200 && result.data?.valid) {
        await fetchLicenseStatus();
        return { success: true, message: result.data.message || '许可证上传成功' };
      }
      return { success: false, message: result?.message || '许可证验证失败' };
    } catch (error: any) {
      console.error('上传许可证失败:', error);
      return { success: false, message: error?.message || '上传失败' };
    } finally {
      loading.value = false;
    }
  }

  function isValid() {
    // 如果后端返回了 errorMessage，即使有 valid: true 也认为是无效的
    if (licenseStatus.value?.errorMessage) {
      return false;
    }
    // 如果 strictMode 为 true 且 enabled 为 false，需要激活
    // 如果 strictMode 为 false（宽松模式），只检查 valid 字段
    if (licenseStatus.value?.strictMode === true && licenseStatus.value?.enabled === false) {
      return false;
    }
    return licenseStatus.value?.valid ?? false;
  }

  function isExpired() {
    return licenseStatus.value?.expired ?? false;
  }

  function getRemainingDays() {
    return licenseStatus.value?.remainingDays ?? 0;
  }

  function getLicenseInfo() {
    return licenseStatus.value?.licenseInfo ?? null;
  }

  function hasModule(moduleName: string) {
    return licenseStatus.value?.licenseInfo?.modules?.includes(moduleName) ?? false;
  }

  function $reset() {
    licenseStatus.value = null;
    machineCode.value = '';
    loading.value = false;
    licenseChecked.value = false;
  }

  return {
    $reset,
    fetchLicenseStatus,
    fetchMachineCode,
    getLicenseInfo,
    getRemainingDays,
    hasModule,
    isExpired,
    isValid,
    licenseChecked,
    licenseStatus,
    loading,
    machineCode,
    uploadLicense,
  };
});
