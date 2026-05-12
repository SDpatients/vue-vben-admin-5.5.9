import { ref } from 'vue'

// 涟漪效果组合式函数
export function useRipple() {
  const ripples = ref<Array<{ id: number; x: number; y: number }>>([])
  let rippleId = 0

  const createRipple = (event: any) => {
    const target = event.currentTarget
    // #ifdef H5
    const rect = target.getBoundingClientRect()
    const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left
    const y = event.touches ? event.touches[0].clientY - rect.top : event.clientY - rect.top
    // #endif
    // #ifndef H5
    const x = event.touches ? event.touches[0].clientX - target.offsetLeft : event.detail?.x || 0
    const y = event.touches ? event.touches[0].clientY - target.offsetTop : event.detail?.y || 0
    // #endif

    const id = rippleId++
    ripples.value.push({ id, x, y })

    setTimeout(() => {
      ripples.value = ripples.value.filter(r => r.id !== id)
    }, 600)
  }

  return { ripples, createRipple }
}
