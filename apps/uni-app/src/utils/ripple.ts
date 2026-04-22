import { ref } from 'vue'

// 涟漪效果组合式函数
export function useRipple() {
  const ripples = ref<Array<{ id: number; x: number; y: number }>>([])
  let rippleId = 0

  const createRipple = (event: any) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left
    const y = event.touches ? event.touches[0].clientY - rect.top : event.clientY - rect.top

    const id = rippleId++
    ripples.value.push({ id, x, y })

    setTimeout(() => {
      ripples.value = ripples.value.filter(r => r.id !== id)
    }, 600)
  }

  return { ripples, createRipple }
}
