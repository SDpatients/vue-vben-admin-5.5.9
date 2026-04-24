/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

export * from '../customer.config';

import { customerConfig } from '../customer.config';

const env = import.meta.env

// Log environment info once
console.log('============ ENV CONFIG ============')
console.log('[Config] Import Meta Env:', {
  VITE_API_BASE_URL: env.VITE_API_BASE_URL,
  VITE_APP_TITLE: env.VITE_APP_TITLE,
  MODE: env.MODE,
  DEV: env.DEV,
  PROD: env.PROD,
})

// API 基础地址配置
// H5 端使用相对路径 '/api'，通过 Vite 代理转发到后端
// 小程序和 APP 端需要在环境变量中配置完整地址
export const getBaseUrl = () => {
  // 浏览器环境使用代理
  if (typeof window !== 'undefined') {
    console.log('[Config] Browser environment detected, using proxy (empty base URL)')
    return ''  // 使用相对路径，让代理处理
  }
  // 非浏览器环境（小程序、APP）使用环境变量
  const baseUrl = env.VITE_API_BASE_URL || 'http://192.168.0.151:8080'
  console.log('[Config] Non-browser environment, base URL:', baseUrl)
  return baseUrl
}

// API 统一前缀配置
// 与网页端保持一致，所有API请求都会自动添加这个前缀
export const API_PREFIX = '/api/v1'

// 文件相关API路径
export const FILE_API = {
  UPLOAD: `${API_PREFIX}/file/upload`,
  PREVIEW: `${API_PREFIX}/file/preview`,
  DOWNLOAD: `${API_PREFIX}/file/download`,
}

// 应用配置
export const appConfig = {
  name: '破管通',
  version: '5.5.9',
  description: '破产执业业务·管理人主办·全生命周期打通完成',
}

// 上传配置
export const uploadConfig = {
  maxSize: 50,
  allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  uploadUrl: FILE_API.UPLOAD,
}

// 分页配置
export const paginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
}

// 缓存配置
export const storageConfig = {
  prefix: 'vben_',
  timeout: 7 * 24 * 60 * 60 * 1000,
}
