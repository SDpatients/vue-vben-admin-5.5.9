import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, refreshToken as refreshTokenApi, type LoginParams, type LoginResult } from '@/api/auth'

interface UserInfo {
  userId: number
  username: string
  realName: string
  accessToken: string
  refreshToken: string
  avatar?: string
}

const TOKEN_EXPIRY_KEY = 'tokenExpiry'
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000

const parseJwt = (token: string): any => {
  try {
    const base64Payload = token.split('.')[1]
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true
  return Date.now() >= (payload.exp * 1000 - TOKEN_EXPIRY_BUFFER)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshTokenValue = ref<string>('')
  const userInfo = shallowRef<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value && !isTokenExpired(token.value))

  const login = async (params: LoginParams) => {
    try {
      const res = await loginApi(params)
      console.log('authStore login - API response:', res)
      
      if (res && res.code === 200 && res.data) {
        token.value = res.data.accessToken
        refreshTokenValue.value = res.data.refreshToken
        userInfo.value = {
          userId: res.data.userId,
          username: res.data.username,
          realName: res.data.realName,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        }

        console.log('Storing token:', res.data.accessToken)
        uni.setStorageSync('token', res.data.accessToken)
        uni.setStorageSync('refreshToken', res.data.refreshToken)
        uni.setStorageSync('userInfo', userInfo.value)
        
        // Verify storage
        const storedToken = uni.getStorageSync('token')
        console.log('Stored token verified:', storedToken)
      }

      return res
    } catch (error) {
      console.error('authStore login - error:', error)
      throw error
    }
  }

  const restoreLoginState = async () => {
    const savedToken = uni.getStorageSync('token')
    const savedRefreshToken = uni.getStorageSync('refreshToken')
    const savedUserInfo = uni.getStorageSync('userInfo')
    console.log('restoreLoginState - savedToken:', savedToken)
    console.log('restoreLoginState - savedRefreshToken:', savedRefreshToken)
    console.log('restoreLoginState - savedUserInfo:', savedUserInfo)
    
    if (!savedToken) {
      return false
    }

    if (isTokenExpired(savedToken)) {
      console.log('Token expired, attempting refresh...')
      if (savedRefreshToken) {
        try {
          const res = await refreshTokenApi(savedRefreshToken)
          if (res && res.code === 200 && res.data) {
            token.value = res.data.accessToken
            refreshTokenValue.value = res.data.refreshToken
            userInfo.value = {
              userId: res.data.userId,
              username: res.data.username,
              realName: res.data.realName,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            }
            uni.setStorageSync('token', res.data.accessToken)
            uni.setStorageSync('refreshToken', res.data.refreshToken)
            uni.setStorageSync('userInfo', userInfo.value)
            console.log('Token refreshed successfully')
            return true
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
      }
      logout()
      return false
    }

    token.value = savedToken
    refreshTokenValue.value = savedRefreshToken || ''
    userInfo.value = savedUserInfo ? JSON.parse(JSON.stringify(savedUserInfo)) : null
    console.log('restoreLoginState - token.value set to:', token.value)
    console.log('restoreLoginState - refreshTokenValue set to:', refreshTokenValue.value)
    return true
  }

  const logout = async () => {
    token.value = ''
    refreshTokenValue.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('userInfo')
  }

  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfoApi()
      if (res && res.data) {
        userInfo.value = {
          ...userInfo.value,
          ...res.data,
        } as UserInfo
        uni.setStorageSync('userInfo', userInfo.value)
      }
      return userInfo.value
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    refreshToken: refreshTokenValue,
    userInfo,
    isLoggedIn,
    login,
    logout,
    restoreLoginState,
    fetchUserInfo,
  }
})
