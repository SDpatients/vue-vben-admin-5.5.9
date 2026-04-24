/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

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

// 检查管理员权限
export interface CheckAdminResult {
  code: number
  message: string
  data: {
    userId: number
    username: string
    isAdmin: boolean
    isSuperAdmin: boolean
    roles: string[]
  }
}

export const checkAdmin = () => {
  return http.get<CheckAdminResult>('/auth/check-admin')
}
