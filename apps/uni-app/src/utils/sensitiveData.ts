import http from '@/api/request'

const LICENSE_EXPIRY_WARNING_SHOWN_KEY = '_license_expiry_warning_shown'

export enum SensitiveDataType {
  USER_MOBILE = 'USER_MOBILE',
  USER_PHONE = 'USER_PHONE',
  CREDITOR_ID_NUMBER = 'CREDITOR_ID_NUMBER',
  CREDITOR_CONTACT_PHONE = 'CREDITOR_CONTACT_PHONE',
  BANK_ACCOUNT_NUMBER = 'BANK_ACCOUNT_NUMBER',
  AGENT_PHONE = 'AGENT_PHONE',
  AGENT_ID_CARD = 'AGENT_ID_CARD',
  CREDITOR_BANK_ACCOUNT = 'CREDITOR_BANK_ACCOUNT',
}

export interface SensitiveDataViewRequest {
  dataType: SensitiveDataType
  id: number
  password: string
}

export interface SensitiveDataViewResponse {
  plainTextValue: string
}

export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export function viewSensitiveData(dataType: SensitiveDataType, id: number, password: string) {
  return http.post<ApiResult<SensitiveDataViewResponse>>('/system/sensitive-data/view', {
    dataType,
    id,
    password,
  } as SensitiveDataViewRequest, { showLoading: true, showErrorToast: false })
}

export function isMasked(value: string | null | undefined): boolean {
  if (!value) return false
  return value.includes('*')
}

export function isAllMasked(value: string | null | undefined): boolean {
  if (!value) return false
  if (value === '***') return true
  return false
}

export function checkLicenseExpiry(data: Record<string, any> | null | undefined): boolean {
  if (!data) return false

  const sensitiveFields = ['idNumber', 'contactPhone', 'mobile', 'phone', 'accountNumber', 'creditorBankAccount', 'agentPhone', 'agentIdCard']

  let allMaskedCount = 0
  let totalSensitiveCount = 0

  for (const key of sensitiveFields) {
    const value = data[key]
    if (value !== undefined && value !== null) {
      totalSensitiveCount++
      if (value === '***') {
        allMaskedCount++
      }
    }
  }

  if (totalSensitiveCount > 0 && allMaskedCount === totalSensitiveCount) {
    const alreadyShown = uni.getStorageSync(LICENSE_EXPIRY_WARNING_SHOWN_KEY)
    if (!alreadyShown) {
      uni.setStorageSync(LICENSE_EXPIRY_WARNING_SHOWN_KEY, '1')
      uni.showModal({
        title: '许可证提示',
        content: '许可证已过期或服务器不匹配，敏感数据无法显示，请联系管理员续期',
        showCancel: false,
        confirmText: '我知道了',
      })
      return true
    }
  }

  return false
}

export function clearLicenseWarningFlag(): void {
  uni.removeStorageSync(LICENSE_EXPIRY_WARNING_SHOWN_KEY)
}