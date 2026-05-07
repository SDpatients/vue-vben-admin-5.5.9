/**
 * Copyright (c) 2026 湖州永惠软件有限公司. All rights reserved.
 * This software is based on Vue Vben Admin (MIT License),
 * Copyright (c) 2024-present, Vben.
 */

import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, refreshToken as refreshTokenApi, logout as logoutApi, type LoginParams, type LoginResult } from '@/api/auth'

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

// 兼容 uni-app 各平台的 base64 解码
const safeAtob = (base64: string): string => {
  // 小程序/APP 环境可能没有 atob，使用 uni.base64ToArrayBuffer 替代
  if (typeof atob === 'undefined') {
    try {
      const arrayBuffer = uni.base64ToArrayBuffer(base64)
      const uint8Array = new Uint8Array(arrayBuffer)
      let result = ''
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i])
      }
      return result
    } catch (e) {
      throw new Error('Base64 decode failed: ' + e)
    }
  }
  return atob(base64)
}

const parseJwt = (token: string): any => {
  try {
    const base64Payload = token.split('.')[1]
    const payload = safeAtob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch (error) {
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
      }

      return res
    } catch (error) {
      throw error
    }
  }

  const restoreLoginState = async () => {
    const savedToken = uni.getStorageSync('token')
    const savedRefreshToken = uni.getStorageSync('refreshToken')
    const savedUserInfo = uni.getStorageSync('userInfo')
    
    if (!savedToken) {
      return false
    }

    if (isTokenExpired(savedToken)) {
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
            return true
          }
        } catch (error) {
          // 静默处理刷新失败
        }
      }
      logout()
      return false
    }

    token.value = savedToken
    refreshTokenValue.value = savedRefreshToken || ''
    userInfo.value = savedUserInfo ? JSON.parse(JSON.stringify(savedUserInfo)) : null
    return true
  }

  const logout = async () => {
    try {
      if (token.value) {
        await logoutApi()
      }
    } catch (_error) {
    } finally {
      token.value = ''
      refreshTokenValue.value = ''
      userInfo.value = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('userInfo')
    }
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
