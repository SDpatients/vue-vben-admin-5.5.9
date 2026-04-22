<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

onLaunch(async () => {
  console.log('App Launch')
  const authStore = useAuthStore()
  await authStore.restoreLoginState()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 引入全局动画 */
@import '@/styles/animations.scss';

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  background-color: #f5f7fa;
}
</style>
