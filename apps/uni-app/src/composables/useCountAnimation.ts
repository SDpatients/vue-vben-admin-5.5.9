import { ref, watch, onUnmounted } from 'vue'

interface UseCountAnimationOptions {
  duration?: number
  delay?: number
  autoStart?: boolean
}

// 兼容的 requestAnimationFrame
const safeRequestAnimationFrame = (callback: FrameRequestCallback): number => {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(callback)
  }
  // 降级方案：使用 setTimeout
  return setTimeout(callback, 16) as unknown as number
}

// 兼容的 cancelAnimationFrame
const safeCancelAnimationFrame = (id: number): void => {
  if (typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(id)
  } else {
    clearTimeout(id)
  }
}

// 数字滚动动画
export function useCountAnimation(
  targetValue: number | (() => number),
  options: UseCountAnimationOptions = {}
) {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
  } = options

  const displayValue = ref(0)
  let animationFrameId: number | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const animate = () => {
    const endValue = typeof targetValue === 'function' ? targetValue() : targetValue
    const startValue = displayValue.value
    const startTime = Date.now()

    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用 easeOutQuart 缓动函数
      const easedProgress = 1 - Math.pow(1 - progress, 4)
      displayValue.value = Math.round(startValue + (endValue - startValue) * easedProgress)

      if (progress < 1) {
        animationFrameId = safeRequestAnimationFrame(step)
      }
    }

    animationFrameId = safeRequestAnimationFrame(step)
  }

  const start = () => {
    if (animationFrameId) {
      safeCancelAnimationFrame(animationFrameId)
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    displayValue.value = 0
    timeoutId = setTimeout(animate, delay)
  }

  if (autoStart) {
    start()
  }

  onUnmounted(() => {
    if (animationFrameId) {
      safeCancelAnimationFrame(animationFrameId)
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return { displayValue, start }
}
