<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import 'leaflet/dist/leaflet.css'

import { useI18n } from '../composables/useI18n'

defineProps({
  conflictName: {
    type: String,
    default: '',
  },
})

const { t } = useI18n()
const mapRoot = ref(null)
let mapInstance = null

onMounted(async () => {
  if (!mapRoot.value) {
    return
  }

  const leafletModule = await import('leaflet')
  const L = leafletModule.default || leafletModule

  mapInstance = L.map(mapRoot.value).setView([20, 0], 2)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  }).addTo(mapInstance)
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
  }
})
</script>

<template>
  <section class="map-card">
    <h2>{{ t('map') }}</h2>
    <div id="conflict-map" ref="mapRoot" />
  </section>
</template>

<style scoped>
.map-card {
  padding: 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
}

h2 {
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 1.2rem;
}

#conflict-map {
  height: 300px;
  border-radius: 8px;
  z-index: 1;
}
</style>
