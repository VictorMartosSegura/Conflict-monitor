<script setup>
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'

const props = defineProps({
  conflict: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits({
  select: (id) => id !== undefined && id !== null,
})

const { t } = useI18n()

const formattedStartDate = computed(() => {
  if (!props.conflict.startDate) {
    return t('dateUnknown')
  }

  const date = new Date(props.conflict.startDate)

  if (Number.isNaN(date.getTime())) {
    return props.conflict.startDate
  }

  return new Intl.DateTimeFormat('en-GB').format(date)
})

const shortDescription = computed(() => {
  const description = props.conflict.description || t('noDescription')

  return description.length > 100 ? `${description.slice(0, 100)}...` : description
})

const statusClass = computed(() => `status-${props.conflict.status?.toLowerCase() || 'unknown'}`)
</script>

<template>
  <article class="conflict-card">
    <div class="card-header">
      <div>
        <p class="eyebrow">{{ t('started') }} {{ formattedStartDate }}</p>
        <h2>{{ conflict.name }}</h2>
      </div>

      <span class="status-badge" :class="statusClass">
        {{ conflict.status }}
      </span>
    </div>

    <p class="description">{{ shortDescription }}</p>

    <button class="details-button" type="button" @click="emit('select', conflict.id)">
      {{ t('viewDetails') }}
    </button>
  </article>
</template>

<style scoped>
.conflict-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  transition:
    box-shadow 180ms ease,
    transform 180ms ease,
    border-color 180ms ease;
}

.conflict-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 16px 32px rgba(245, 158, 11, 0.18);
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin-bottom: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h2 {
  color: #ffffff;
  font-size: 1.35rem;
  line-height: 1.2;
}

.status-badge {
  flex: 0 0 auto;
  padding: 0.35rem 0.65rem;
  color: #ffffff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
}

.status-active {
  background: #dc2626;
}

.status-frozen {
  background: #2563eb;
}

.status-ended {
  background: #16a34a;
}

.status-unknown {
  background: #64748b;
}

.description {
  flex: 1;
  color: #cbd5e1;
  line-height: 1.65;
}

.details-button {
  width: 100%;
  padding: 0.8rem 1rem;
  color: #0f172a;
  background: #f59e0b;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.details-button:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

.details-button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 3px;
}

@media (max-width: 420px) {
  .card-header {
    flex-direction: column;
  }
}
</style>
