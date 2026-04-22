import http from './request'

export interface LoginParams {
  username: string
  password: string
  smsCode?: string
}

export interface LoginResult {
  code: number
  message: string
  data: {
    accessToken: string
    realName: string
    refreshToken: string
    userId: number
    username: string
  }
}

// 登录
export const login = (params: LoginParams) => {
  return http.post<LoginResult>('/auth/login', params, { showErrorToast: false })
}

// 登出
export const logout = () => {
  return http.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return http.get('/auth/current-user')
}

// 刷新 token
export const refreshToken = (refreshToken: string) => {
  return http.post<LoginResult>('/auth/refresh-token', { refreshToken })
}
