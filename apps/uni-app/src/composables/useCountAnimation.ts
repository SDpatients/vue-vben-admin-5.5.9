import { ref, watch, onUnmounted } from 'vue'

interface UseCountAnimationOptions {
  duration?: number
  delay?: number
  autoStart?: boolean
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
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)
  }

  const start = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
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
      cancelAnimationFrame(animationFrameId)
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return { displayValue, start }
}
