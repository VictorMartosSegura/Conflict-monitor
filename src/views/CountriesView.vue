<script setup>
import AppHeader from '../components/AppHeader.vue'
</script>

<template>
  <AppHeader />

  <main class="view-page">
    <h1>Countries</h1>
  </main>
</template>

<style scoped>
.view-page {
  padding: clamp(1.5rem, 5vw, 5rem);
}
</style>
