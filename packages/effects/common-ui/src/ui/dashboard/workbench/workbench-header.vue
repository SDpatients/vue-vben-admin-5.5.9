<script lang="ts" setup>
import { VbenAvatar } from '@vben-core/shadcn-ui';

interface Props {
  avatar?: string;
  todoCount?: number;
  todoTotal?: number;
  caseCount?: number;
  teamCount?: number;
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
});
</script>
<template>
  <div class="card-box p-4 py-6 lg:flex">
    <VbenAvatar :src="avatar" class="size-20" />
    <div
      v-if="$slots.title || $slots.description"
      class="flex flex-col justify-center md:ml-6 md:mt-0"
    >
      <h1 v-if="$slots.title" class="text-md font-semibold md:text-xl">
        <slot name="title"></slot>
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
