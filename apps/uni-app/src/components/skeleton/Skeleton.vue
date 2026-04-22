<template>
  <view class="skeleton-wrapper" :style="{ width, height }">
    <view v-if="loading" class="skeleton" :class="{ 'skeleton-circle': circle, 'skeleton-text': !circle }"></view>
    <slot v-else></slot>
  </view>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  width?: string
  height?: string
  circle?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: true,
  width: '100%',
  height: 'auto',
  circle: false,
})
</script>

<style lang="scss" scoped>
.skeleton-wrapper {
  display: inline-block;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
}

.skeleton-text {
  height: 32rpx;
}

.skeleton-circle {
  border-radius: 50%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
