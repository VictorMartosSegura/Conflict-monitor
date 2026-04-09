<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '../components/AppHeader.vue'
import StatCard from '../components/StatCard.vue'
import { useConflictStore } from '../stores/conflictStore'

const API_BASE_URL = 'http://localhost:8080'

const route = useRoute()
const router = useRouter()
const conflictStore = useConflictStore()
const { currentConflict, error } = storeToRefs(conflictStore)

const factions = ref([])
const events = ref([])
const pageLoading = ref(false)
const secondaryError = ref(null)

const sortedEvents = computed(() =>
  [...events.value].sort((eventA, eventB) => eventA.eventDate.localeCompare(eventB.eventDate)),
)

const statusClass = computed(() => `status-${currentConflict.value?.status?.toLowerCase() || 'unknown'}`)

async function requestJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Date unknown'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat('en-GB').format(date)
}

function getFlag(code) {
  const flags = {
    UKR: 'ua',
    RUS: 'ru',
    USA: 'us',
    GBR: 'gb',
    FRA: 'fr',
    DEU: 'de',
    CHN: 'cn',
  }

  return flags[code] || 'un'
}

async function fetchSecondaryData() {
  const [fetchedFactions, fetchedEvents] = await Promise.all([
    requestJson('/api/v1/factions'),
    requestJson('/api/v1/events'),
  ])

  factions.value = fetchedFactions
  events.value = fetchedEvents
}

onMounted(async () => {
  pageLoading.value = true
  secondaryError.value = null

  try {
    await Promise.all([conflictStore.fetchConflictById(route.params.id), fetchSecondaryData()])
  } catch (caughtError) {
    if (!error.value) {
      secondaryError.value =
        caughtError instanceof Error ? caughtError.message : 'Unable to load supporting data'
    }
  } finally {
    pageLoading.value = false
  }
})

function backToConflicts() {
  router.push('/conflicts')
}
</script>

<template>
  <AppHeader />

  <main class="detail-page">
    <p v-if="pageLoading" class="state-message">Loading conflict details...</p>
    <p v-else-if="error" class="state-message error-message">{{ error }}</p>

    <template v-else-if="currentConflict">
      <button class="back-button" type="button" @click="backToConflicts">
        ← Back to Conflicts
      </button>

      <section class="conflict-header">
        <div class="title-row">
          <h1>{{ currentConflict.name }}</h1>
          <span class="status-badge" :class="statusClass">{{ currentConflict.status }}</span>
        </div>

        <p class="start-date">📅 {{ formatDate(currentConflict.startDate) }}</p>
        <p class="description">{{ currentConflict.description }}</p>
      </section>

      <p v-if="secondaryError" class="state-message error-message">{{ secondaryError }}</p>

      <section class="stats-row" aria-label="Conflict statistics">
        <StatCard title="Factions" :value="factions.length" icon="🏴" color="#f59e0b" />
        <StatCard title="Events" :value="events.length" icon="📅" color="#38bdf8" />
        <StatCard title="Status" :value="currentConflict.status" icon="●" color="#16a34a" />
      </section>

      <section class="detail-columns">
        <article class="info-card">
          <h2>🏴 Factions</h2>

          <p v-if="factions.length === 0" class="empty-message">No factions found.</p>

          <ul v-else class="faction-list">
            <li v-for="faction in factions" :key="faction.id" class="faction-item">
              <strong>{{ faction.name }}</strong>

              <div class="supporters">
                <span
                  v-for="country in faction.supporters"
                  :key="country.id"
                  class="supporter-country"
                >
                  <img
                    :alt="`${country.name} flag`"
                    :src="`https://flagcdn.com/24x18/${getFlag(country.code)}.png`"
                    width="24"
                    height="18"
                  />
                  {{ country.name }}
                </span>
              </div>
            </li>
          </ul>
        </article>

        <article class="info-card">
          <h2>📅 Timeline of Events</h2>

          <p v-if="sortedEvents.length === 0" class="empty-message">No events found.</p>

          <ol v-else class="timeline">
            <li v-for="event in sortedEvents" :key="event.id" class="timeline-event">
              <time>{{ formatDate(event.eventDate) }}</time>
              <strong>{{ event.location }}</strong>
              <p>{{ event.description }}</p>
            </li>
          </ol>
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detail-page {
  width: min(100%, 900px);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem);
}

.back-button {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  color: #0f172a;
  background: #f59e0b;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    transform 170ms ease;
}

.back-button:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

.conflict-header,
.info-card,
.state-message {
  padding: clamp(1rem, 4vw, 2rem);
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.conflict-header {
  margin-bottom: 1.5rem;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

h1 {
  color: #ffffff;
  font-size: clamp(2rem, 6vw, 4.5rem);
  line-height: 1;
}

h2 {
  margin-bottom: 1.25rem;
  color: #ffffff;
  font-size: 1.35rem;
}

.status-badge {
  flex: 0 0 auto;
  padding: 0.45rem 0.75rem;
  color: #ffffff;
  border-radius: 999px;
  font-size: 0.8rem;
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

.start-date {
  margin-bottom: 1rem;
  color: #f59e0b;
  font-weight: 800;
}

.description,
.timeline-event p,
.empty-message {
  color: #cbd5e1;
  line-height: 1.7;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.detail-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.faction-list {
  display: grid;
  gap: 1rem;
  list-style: none;
}

.faction-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.faction-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.faction-item strong,
.timeline-event strong {
  display: block;
  color: #ffffff;
}

.supporters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.supporter-country {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.55rem;
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.supporter-country img {
  display: block;
  object-fit: cover;
}

.timeline {
  display: grid;
  gap: 1.25rem;
  padding-left: 1rem;
  border-left: 2px solid #f59e0b;
  list-style: none;
}

.timeline-event {
  position: relative;
  padding-left: 1rem;
}

.timeline-event::before {
  position: absolute;
  top: 0.35rem;
  left: -1.45rem;
  width: 0.75rem;
  aspect-ratio: 1;
  background: #f59e0b;
  border: 3px solid #1e293b;
  border-radius: 50%;
  content: '';
}

.timeline-event time {
  display: block;
  margin-bottom: 0.35rem;
  color: #f59e0b;
  font-size: 0.85rem;
  font-weight: 800;
}

.timeline-event strong {
  margin-bottom: 0.35rem;
}

.state-message {
  color: #cbd5e1;
  font-weight: 800;
}

.error-message {
  margin-bottom: 1.5rem;
  color: #fecaca;
  border-color: #dc2626;
}

@media (max-width: 760px) {
  .title-row,
  .detail-columns {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
