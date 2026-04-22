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
  console.log('requestInterceptor - token:', token)
  options.headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }
  console.log('requestInterceptor - final headers:', options.headers)
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
      uni.removeStorageSync('token')
      uni.navigateTo({ url: '/pages/login/index' })
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
  
  let finalUrl = `${getBaseUrl()}${requestUrl}`

  // 对于GET请求，将params拼接到URL中
  let requestData = config.data
  if ((config.method === 'GET' || config.method === 'DELETE') && config.params) {
    const queryString = buildQueryString(config.params)
    if (queryString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString
    }
  }

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
        console.log('Response received:', res)
        responseInterceptor<T>(res, showErrorToast)
          .then((data) => resolve(data as T))
          .catch(reject)
      },
      fail: (err: UniApp.GeneralCallbackResult) => {
        console.error('Request failed:', err)
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

  patch: <T = any>(url: string, data?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PATCH', data, ...config }),

  delete: <T = any>(url: string, params?: any, config?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', params, ...config }),
}

export default http
