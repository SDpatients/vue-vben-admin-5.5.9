<script setup lang="ts">
import { computed } from 'vue';

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
});

const props = defineProps<{
  content: string;
}>();

const rendered = computed(() => md.render(props.content));
</script>

<template>
  <div class="md-render" v-html="rendered"></div>
</template>

<style scoped>
.md-render {
  word-break: break-word;
  line-height: 1.7;
}

.md-render :deep(p) {
  margin: 0 0 8px;
}

.md-render :deep(p:last-child) {
  margin-bottom: 0;
}

.md-render :deep(h1),
.md-render :deep(h2),
.md-render :deep(h3),
.md-render :deep(h4),
.md-render :deep(h5),
.md-render :deep(h6) {
  margin: 16px 0 8px;
  font-weight: 600;
  color: #1e293b;
}

.md-render :deep(h1) { font-size: 18px; }
.md-render :deep(h2) { font-size: 16px; }
.md-render :deep(h3) { font-size: 15px; }

.md-render :deep(ul),
.md-render :deep(ol) {
  margin: 6px 0;
  padding-left: 22px;
}

.md-render :deep(li) {
  margin: 3px 0;
}

.md-render :deep(strong) {
  font-weight: 600;
}

.md-render :deep(code) {
  display: inline;
  padding: 2px 6px;
  font-size: 13px;
  font-family: 'SF Mono', Consolas, monospace;
  background: #f1f5f9;
  border-radius: 4px;
  color: #1d4ed8;
}

.md-render :deep(pre) {
  margin: 10px 0;
  padding: 14px 16px;
  overflow-x: auto;
  background: #1e293b;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.55;
}

.md-render :deep(pre code) {
  display: block;
  padding: 0;
  background: none;
  border-radius: 0;
  color: #e2e8f0;
  white-space: pre;
}

.md-render :deep(blockquote) {
  margin: 10px 0;
  padding: 8px 14px;
  border-left: 3px solid #94a3b8;
  color: #475569;
  background: #f8fafc;
  border-radius: 0 6px 6px 0;
}

.md-render :deep(a) {
  color: #1d4ed8;
  text-decoration: underline;
}

.md-render :deep(table) {
  width: 100%;
  margin: 10px 0;
  border-collapse: collapse;
  font-size: 13px;
}

.md-render :deep(th),
.md-render :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.md-render :deep(th) {
  background: #f8fafc;
  font-weight: 600;
}

.md-render :deep(tr:nth-child(even)) {
  background: #f8fafc;
}

.md-render :deep(hr) {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e2e8f0;
}
</style>