<script lang="ts" setup>
import { VbenAvatar } from '@vben-core/shadcn-ui';

interface Props {
  avatar?: string;
  todoCount?: number;
  todoTotal?: number;
  caseCount?: number;
  teamCount?: number;
  realName?: string;
}

defineOptions({
  name: 'WorkbenchHeader',
});

withDefaults(defineProps<Props>(), {
  avatar: '',
  todoCount: 0,
  todoTotal: 0,
  caseCount: 0,
  teamCount: 0,
  realName: '',
});

const emit = defineEmits(['logout', 'change-password']);

const handleLogout = () => {
  emit('logout');
};

const handleChangePassword = () => {
  emit('change-password');
};
</script>
<template>
  <div class="card-box p-4 py-6 lg:flex">
    <div class="size-10 relative flex flex-shrink-0 items-center">
      <span class="inline-flex items-center justify-center font-normal text-foreground select-none shrink-0 bg-secondary overflow-hidden rounded-full text-xs size-full">
        <template v-if="realName && realName.length > 0">
          <span class="text-sm font-medium">{{ realName.charAt(0) }}</span>
        </template>
        <template v-else>
          <img role="img" src="https://unpkg.com/@vbenjs/static-source@0.1.7/source/avatar-v1.webp" class="h-full w-full object-cover" alt="avatar" style="object-fit: cover;">
        </template>
      </span>
    </div>
    <div
      v-if="$slots.title || $slots.description"
      class="flex flex-col justify-center md:ml-6 md:mt-0"
    >
      <h1 v-if="$slots.title" class="text-md font-semibold md:text-xl">
        <div class="flex items-center justify-between">
          <slot name="title"></slot>
          <div class="flex items-center gap-2">
            <button 
              class="text-primary text-sm hover:underline"
              @click="handleChangePassword"
            >
              [修改密码]
            </button>
            <button 
              class="text-primary text-sm hover:underline"
              @click="handleLogout"
            >
              [退出登录]
            </button>
          </div>
        </div>
      </h1>
      <span v-if="$slots.description" class="text-foreground/80 mt-1">
        <slot name="description"></slot>
      </span>
    </div>
    <div class="mt-4 flex flex-1 justify-end md:mt-0">
      <div class="flex flex-col justify-center text-right">
        <span class="text-foreground/80"> 待办 </span>
        <span class="text-2xl">{{ todoCount }}/{{ todoTotal }}</span>
      </div>

      <div class="mx-12 flex flex-col justify-center text-right md:mx-16">
        <span class="text-foreground/80"> 案件 </span>
        <span class="text-2xl">{{ caseCount }}</span>
      </div>
      <div class="mr-4 flex flex-col justify-center text-right md:mr-10">
        <span class="text-foreground/80"> 团队 </span>
        <span class="text-2xl">{{ teamCount }}</span>
      </div>
    </div>
  </div>
</template>
