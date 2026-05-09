/**
 * 跨平台获取页面参数工具
 * 
 * 在 uni-app 的 APP/小程序端，getCurrentPages().options 可能返回空对象，
 * 需要从 $page.fullPath 中解析 URL 参数作为兜底方案。
 */

export function getPageParam(key: string): string {
  try {
    const pages = getCurrentPages()
    if (!pages || pages.length === 0) {
      return ''
    }

    const page = pages[pages.length - 1]

    if (page?.options && page.options[key] !== undefined) {
      const val = String(page.options[key])
      return val
    }

    const fullPath = (page as any)?.$page?.fullPath || ''
    if (fullPath) {
      const regex = new RegExp(`[?&]${encodeURIComponent(key)}=([^&]*)`)
      const match = fullPath.match(regex)
      if (match) {
        const val = decodeURIComponent(match[1])
        return val
      }
    }

    const query = (page as any)?.$route?.query
    if (query && query[key] !== undefined) {
      const val = String(query[key])
      return val
    }

    return ''
  } catch (e: any) {
    return ''
  }
}

export function getParamFromOptions(options: Record<string, any> | undefined, key: string): string {
  if (!options || options[key] === undefined || options[key] === null) return ''
  return String(options[key])
}
