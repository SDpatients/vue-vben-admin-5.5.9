import http from './request'

export interface UserProfile {
  id: number
  username: string
  realName: string
  mobile: string
  email: string
  phone: string
  status: string
  roles: string[]
  permissions: string[]
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface ForgotPasswordSendSmsParams {
  mobile: string
}

export interface ForgotPasswordResetParams {
  mobile: string
  smsCode: string
  newPassword: string
}

export interface UpdateMobileParams {
  mobile: string
  smsCode?: string
}

export interface UpdateEmailParams {
  email: string
}

export interface UpdateRealNameParams {
  realName: string
}

export const profileApi = {
  getCurrentUser: () => {
    return http.get<{ code: number; message: string; data: UserProfile }>('/auth/current-user')
  },

  changePassword: (data: ChangePasswordParams) => {
    return http.post('/auth/change-password', data)
  },

  forgotPasswordSendSms: (data: ForgotPasswordSendSmsParams) => {
    return http.post('/auth/forgot-password/send-sms', data)
  },

  forgotPasswordReset: (data: ForgotPasswordResetParams) => {
    return http.post('/auth/forgot-password/reset', data)
  },

  updateMobile: (data: UpdateMobileParams) => {
    return http.put<{ code: number; message: string; data: UserProfile }>('/auth/profile/mobile', data)
  },

  updateEmail: (data: UpdateEmailParams) => {
    return http.put<{ code: number; message: string; data: UserProfile }>('/auth/profile/email', data)
  },

  updateRealName: (data: UpdateRealNameParams) => {
    return http.put<{ code: number; message: string; data: UserProfile }>('/auth/profile/real-name', data)
  },
}

export default profileApi
