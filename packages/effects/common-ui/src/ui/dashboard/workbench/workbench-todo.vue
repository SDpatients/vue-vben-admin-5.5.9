<script setup lang="ts">
import type { WorkbenchTodoItem } from '../typing';

import { ref } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VbenCheckbox,
  VbenPopover,
} from '@vben-core/shadcn-ui';

interface Props {
  items?: WorkbenchTodoItem[];
  title: string;
}

defineOptions({
  name: 'WorkbenchTodo',
});

withDefaults(defineProps<Props>(), {
  items: () => [],
});

const openPopoverMap = ref<Record<string, boolean>>({});

function togglePopover(itemTitle: string, open?: boolean) {
  openPopoverMap.value[itemTitle] = open ?? !openPopoverMap.value[itemTitle];
}
</script>

<template>
  <Card>
    <CardHeader class="py-4">
      <CardTitle class="text-lg">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent class="flex flex-wrap p-5 pt-0">
      <ul class="divide-border w-full divide-y" role="list">
        <li
          v-for="item in items"
          :key="item.title"
          :class="{
            'select-none line-through opacity-60': item.completed,
          }"
          class="flex cursor-pointer justify-between gap-x-6 py-5"
        >
          <VbenPopover
            :open="openPopoverMap[item.title]"
            @update:open="(val) => togglePopover(item.title, val)"
            content-class="w-[400px]"
          >
            <template #trigger>
              <div
                class="flex min-w-0 items-center gap-x-4 flex-1"
                @click.stop="togglePopover(item.title)"
                @mouseenter="togglePopover(item.title, true)"
                @mouseleave="togglePopover(item.title, false)"
              >
                <VbenCheckbox v-model:checked="item.completed" name="completed" />
                <div class="min-w-0 flex-auto">
                  <p class="text-foreground text-sm font-semibold leading-6">
                    {{ item.title }}
                  </p>
                  <!-- eslint-disable vue/no-v-html -->
                  <p
                    class="text-foreground/80 *:text-primary mt-1 truncate text-xs leading-5"
                    v-html="item.content"
                  ></p>
                </div>
              </div>
            </template>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-foreground mb-3">{{ item.title }}</h3>
              <div class="mb-3">
                <span class="text-foreground/60 text-sm">状态：</span>
                <span :class="item.completed ? 'text-green-600' : 'text-amber-600'" class="text-sm font-medium">
                  {{ item.completed ? '已完成' : '待处理' }}
                </span>
              </div>
              <div class="mb-3">
                <span class="text-foreground/60 text-sm">日期：</span>
                <span class="text-sm">{{ item.date }}</span>
              </div>
              <div>
                <span class="text-foreground/60 text-sm">内容：</span>
                <!-- eslint-disable vue/no-v-html -->
                <p class="text-sm text-foreground mt-1" v-html="item.content"></p>
              </div>
            </div>
          </VbenPopover>
          <div class="hidden h-full shrink-0 sm:flex sm:flex-col sm:items-end">
            <span class="text-foreground/80 mt-6 text-xs leading-6">
              {{ item.date }}
            </span>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
