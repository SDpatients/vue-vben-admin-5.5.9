import { ElMessage, ElMessageBox } from 'element-plus';
import { checkLicenseDataMasked, isSensitiveDataMasked } from '#/utils/password-validator';

let licenseWarningShown = false;

export function resetLicenseWarning() {
  licenseWarningShown = false;
}

const LICENSE_EXPIRED_MESSAGE =
  '许可证已过期或服务器不匹配，敏感数据无法显示，请联系管理员续期';

function checkResponseData(data: any): boolean {
  if (!data) return false;
  if (Array.isArray(data)) {
    for (const item of data) {
      if (checkLicenseDataMasked(item)) return true;
    }
    return false;
  }
  if (typeof data === 'object') {
    if (checkLicenseDataMasked(data)) return true;
    if (data.list && Array.isArray(data.list)) {
      for (const item of data.list) {
        if (checkLicenseDataMasked(item)) return true;
      }
    }
    if (data.records && Array.isArray(data.records)) {
      for (const item of data.records) {
        if (checkLicenseDataMasked(item)) return true;
      }
    }
    if (data.users && Array.isArray(data.users)) {
      for (const item of data.users) {
        if (checkLicenseDataMasked(item)) return true;
      }
    }
  }
  return false;
}

export function createLicenseCheckInterceptor() {
  return {
    fulfilled: (response: any) => {
      if (licenseWarningShown) return response;

      try {
        let dataToCheck: any;

        if (response?.data) {
          dataToCheck = response.data;
        } else if (response?.config?.responseReturn === 'data') {
          dataToCheck = response;
        } else {
          dataToCheck = response;
        }

        if (checkResponseData(dataToCheck)) {
          licenseWarningShown = true;
          setTimeout(() => {
            ElMessageBox.alert(LICENSE_EXPIRED_MESSAGE, '许可证提醒', {
              confirmButtonText: '我知道了',
              type: 'warning',
              callback: () => {
                licenseWarningShown = false;
              },
            });
          }, 500);
        }
      } catch (_e) {
        // 静默处理检测错误
      }

      return response;
    },
    rejected: (error: any) => Promise.reject(error),
  };
}

export function showLicenseExpiryWarning() {
  ElMessage.warning(LICENSE_EXPIRED_MESSAGE);
}