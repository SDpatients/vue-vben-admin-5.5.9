/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { getBaseUrl, API_PREFIX } from '@/config'

let isRedirectingToLogin = false

function getBaseUrl8080(): string {
  const baseUrl = getBaseUrl()
  return baseUrl.replace(/:\d+/, ':8080')
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
  showLoading?: boolean
  showErrorToast?: boolean
  skipPrefix?: boolean
  _baseUrlOverride?: string
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

const requestInterceptor = (options: RequestOptions) => {
  const token = uni.getStorageSync('token')

  // 如果是 FormData，不设置 Content-Type，让浏览器自动处理
  // 使用 typeof 检查 FormData 是否存在（小程序/APP 环境可能没有 FormData）
  const isFormData = typeof FormData !== 'undefined' && options.data instanceof FormData
  if (!isFormData) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  } else {
    // FormData 时，不设置 Content-Type，让浏览器自动设置 boundary
    options.headers = {
      ...options.headers,
    }
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }

  return options
}

const responseInterceptor = <T>(response: any, showErrorToast: boolean = true): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const { statusCode, data } = response

    if (statusCode === 200) {
      if (data.code === 0 || data.code === 200) {
        resolve(data)
      } else {
        if (showErrorToast) {
          uni.showToast({
            title: data.message || '请求失败',
            icon: 'none',
          })
        }
        reject(data)
      }
    } else if (statusCode === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        uni.removeStorageSync('token')
        uni.navigateTo({
          url: '/pages/login/index',
          complete: () => {
            isRedirectingToLogin = false
          }
        })
      }
      reject(new Error('登录已过期'))
    } else {
      if (showErrorToast) {
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        })
      }
      reject(new Error('网络错误'))
    }
  })
}

const buildQueryString = (params: Record<string, any>): string => {
  const queryParts: string[] = []
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    }
  }
  return queryParts.join('&')
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  const { showLoading = true, showErrorToast = true, skipPrefix = false } = options

  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  const config = requestInterceptor(options)
  
  // 自动添加API前缀（除非明确指定跳过）
  let requestUrl = config.url
  if (!skipPrefix && !requestUrl.startsWith(API_PREFIX)) {
    requestUrl = `${API_PREFIX}${requestUrl}`
  }
  
  let finalUrl = `${options._baseUrlOverride || getBaseUrl()}${requestUrl}`

  // 对于GET请求，将params拼接到URL中
  let requestData = config.data
  if ((config.method === 'GET' || config.method === 'DELETE') && config.params) {
    const queryString = buildQueryString(config.params)
    if (queryString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method: config.method || 'GET',
      data: requestData,
      header: config.headers,
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        responseInterceptor<T>(res, showErrorToast)
          .then((data) => resolve(data as T))
          .catch(reject)
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        if (showLoading) {
          uni.hideLoading()
        }
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
        reject(err)
      },
      complete: () => {
        if (showLoading) {
          uni.hideLoading()
        }
      },
    })
  })
}

export const http = {
  get: <T = any>(url: string, params?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', params, ...config }),
  post: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...config }),
  put: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...config }),
  delete: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', data, ...config }),
  patch: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PATCH', data, ...config }),
}

export default http
export { getBaseUrl, getBaseUrl8080 }

/**
 * http8080 客户端 - 用于访问特殊前缀的API（双api前缀）
 * 这些API在Controller中显式定义了 /api/xxx 路径，加上 context-path /api/v1 后
 * 实际路径为 /api/v1/api/xxx
 * 此客户端会自动添加 /api/v1 前缀，并指向8080端口
 */
export const http8080 = {
  get: <T = any>(url: string, params?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', params, ...config, _baseUrlOverride: getBaseUrl8080() }),
  post: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...config, _baseUrlOverride: getBaseUrl8080() }),
  put: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...config, _baseUrlOverride: getBaseUrl8080() }),
  delete: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', data, ...config, _baseUrlOverride: getBaseUrl8080() }),
  patch: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PATCH', data, ...config, _baseUrlOverride: getBaseUrl8080() }),
}
