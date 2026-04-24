/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { getBaseUrl, API_PREFIX } from '@/config'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
  showLoading?: boolean
  showErrorToast?: boolean
  skipPrefix?: boolean // 是否跳过自动添加前缀
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

const requestInterceptor = (options: RequestOptions) => {
  const token = uni.getStorageSync('token')
  console.log('============ REQUEST INTERCEPTOR ============')
  console.log('[Interceptor] Target URL:', options.url)
  console.log('[Interceptor] Method:', options.method || 'GET')
  console.log('[Interceptor] Request token type:', typeof token)
  console.log('[Interceptor] Request token length:', token?.length)
  console.log('[Interceptor] Request token:', token ? `${token.substring(0, 30)}...` : 'NULL/EMPTY')
  
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
    console.log('[Interceptor] Authorization header added')
  } else {
    console.log('[Interceptor] No token available, skipping Authorization header')
  }
  console.log('[Interceptor] Final headers:', JSON.stringify(options.headers, null, 2))
  console.log('============ REQUEST INTERCEPTOR END ============')
  return options
}

const responseInterceptor = <T>(response: any, showErrorToast: boolean = true): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const { statusCode, data } = response
    console.log('============ RESPONSE INTERCEPTOR ============')
    console.log('[Response] Status code:', statusCode)
    console.log('[Response] Data:', JSON.stringify(data, null, 2))
    console.log('[Response] Data code:', data?.code)
    console.log('[Response] Data message:', data?.message)

    if (statusCode === 200) {
      if (data.code === 0 || data.code === 200) {
        console.log('[Response] Response is successful')
        console.log('============ RESPONSE INTERCEPTOR END ============')
        resolve(data)
      } else {
        console.log('[Response] Business logic failed - code:', data.code)
        console.log('[Response] Business logic failed - message:', data.message)
        console.log('============ RESPONSE INTERCEPTOR END ============')
        if (showErrorToast) {
          uni.showToast({
            title: data.message || '请求失败',
            icon: 'none',
          })
        }
        reject(data)
      }
    } else if (statusCode === 401) {
      console.log('[Response] Unauthorized (401) - clearing token')
      console.log('============ RESPONSE INTERCEPTOR END ============')
      uni.removeStorageSync('token')
      uni.navigateTo({ url: '/pages/login/index' })
      reject(new Error('登录已过期'))
    } else {
      console.log('[Response] Network error - status code:', statusCode)
      console.log('============ RESPONSE INTERCEPTOR END ============')
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
  
  let finalUrl = `${getBaseUrl()}${requestUrl}`
  console.log('[Request] Base URL:', getBaseUrl())
  console.log('[Request] Request URL:', requestUrl)
  console.log('[Request] Final URL:', finalUrl)

  // 对于GET请求，将params拼接到URL中
  let requestData = config.data
  if ((config.method === 'GET' || config.method === 'DELETE') && config.params) {
    const queryString = buildQueryString(config.params)
    if (queryString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString
    }
  }

  console.log('[Request] Request data:', JSON.stringify(requestData, null, 2))
  console.log('Making request:', {
    url: finalUrl,
    method: config.method || 'GET',
    data: requestData,
    header: config.headers,
  })

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method: config.method || 'GET',
      data: requestData,
      header: config.headers,
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        console.log('[Request] Response received')
        console.log('[Request] Response status code:', res.statusCode)
        console.log('[Request] Response data:', JSON.stringify(res.data, null, 2))
        responseInterceptor<T>(res, showErrorToast)
          .then((data) => resolve(data as T))
          .catch(reject)
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        console.log('[Request] Request failed')
        console.log('[Request] Error message:', err.errMsg)
        console.log('[Request] Error:', JSON.stringify(err, null, 2))
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
  delete: <T = any>(url: string, params?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', params, ...config }),
  patch: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PATCH', data, ...config }),
}

export default http
export { getBaseUrl }
