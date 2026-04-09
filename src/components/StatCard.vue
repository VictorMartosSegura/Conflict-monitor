<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#f59e0b',
  },
})
</script>

<template>
  <article class="stat-card" :style="{ '--stat-color': color }">
    <div class="stat-icon">{{ icon }}</div>
    <strong class="stat-value">{{ value }}</strong>
    <p class="stat-title">{{ title }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  padding: 1.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  text-align: center;
}

.stat-icon {
  margin-bottom: 0.75rem;
  color: var(--stat-color);
  font-size: 2rem;
  line-height: 1;
}

.stat-value {
  display: block;
  color: #ffffff;
  font-size: 2.25rem;
  line-height: 1;
}

.stat-title {
  margin-top: 0.75rem;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 700;
}
</style>
