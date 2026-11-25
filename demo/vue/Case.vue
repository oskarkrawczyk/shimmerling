<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { checkLayout } from '../layout-check.js';

defineProps({ title: String });
const body = ref(null);
const result = ref(null);
let live = true;
onMounted(() => document.fonts.ready.then(() => setTimeout(() => { if (live) result.value = checkLayout(body.value); })));
onBeforeUnmount(() => { live = false; });
</script>

<template>
  <section class="case">
    <h2>{{ title }}</h2>
    <p><slot /></p>
    <div ref="body"><slot name="demo" /></div>
    <div :class="['check', result && (result.ok ? 'ok' : 'bad')]">{{ result?.text }}</div>
  </section>
</template>
