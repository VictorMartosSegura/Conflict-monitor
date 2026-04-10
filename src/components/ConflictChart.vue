<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

import { useI18n } from '../composables/useI18n'

ChartJS.register(ArcElement, Legend, Tooltip)
const { t } = useI18n()

const props = defineProps({
  active: {
    type: Number,
    required: true,
  },
  frozen: {
    type: Number,
    required: true,
  },
  ended: {
    type: Number,
    required: true,
  },
})

const chartData = computed(() => ({
  labels: [t('active'), t('frozen'), t('ended')],
  datasets: [
    {
      data: [props.active, props.frozen, props.ended],
      backgroundColor: ['#dc2626', '#2563eb', '#16a34a'],
      borderColor: '#1e293b',
      borderWidth: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#ffffff',
        padding: 18,
      },
    },
  },
}
</script>

<template>
  <section class="chart-card">
    <h2>{{ t('conflictsByStatus') }}</h2>

    <div class="chart-wrapper">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  padding: 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

h2 {
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 1.2rem;
}

.chart-wrapper {
  min-height: 280px;
}
</style>
