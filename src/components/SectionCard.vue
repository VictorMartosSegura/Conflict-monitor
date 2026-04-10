<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="section-card">
    <div class="section-header">
      <span>{{ icon }} {{ title }}</span>
      <slot name="actions" />
    </div>

    <div class="section-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="section-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.section-card {
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
}

.section-body {
  color: #cbd5e1;
}

.section-footer {
  margin-top: 1rem;
  color: #94a3b8;
}
</style>
