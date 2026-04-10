<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '../components/AppHeader.vue'
import ConflictMap from '../components/ConflictMap.vue'
import SectionCard from '../components/SectionCard.vue'
import StatCard from '../components/StatCard.vue'
import { useI18n } from '../composables/useI18n'
import { useConflictStore } from '../stores/conflictStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const conflictStore = useConflictStore()
const { currentConflict, error } = storeToRefs(conflictStore)

const factions = ref([])
const events = ref([])
const pageLoading = ref(false)
const secondaryError = ref(null)
const isEditing = ref(false)
const saveLoading = ref(false)
const editForm = ref({
  name: '',
  startDate: '',
  status: 'ACTIVE',
  description: '',
})

const sortedEvents = computed(() =>
  [...events.value].sort((eventA, eventB) => eventA.eventDate.localeCompare(eventB.eventDate)),
)

const statusClass = computed(() => `status-${currentConflict.value?.status?.toLowerCase() || 'unknown'}`)

async function requestJson(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function formatDate(dateValue) {
  if (!dateValue) {
    return t('dateUnknown')
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
        caughtError instanceof Error ? caughtError.message : t('detailSupportError')
    }
  } finally {
    pageLoading.value = false
  }
})

function backToConflicts() {
  router.push('/conflicts')
}

function startEditing() {
  if (!currentConflict.value) {
    return
  }

  editForm.value = {
    name: currentConflict.value.name || '',
    startDate: currentConflict.value.startDate || '',
    status: currentConflict.value.status || 'ACTIVE',
    description: currentConflict.value.description || '',
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveConflict() {
  saveLoading.value = true

  try {
    await requestJson(`/api/v1/conflicts/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editForm.value),
    })

    await conflictStore.fetchConflictById(route.params.id)
    isEditing.value = false
  } catch (caughtError) {
    secondaryError.value = caughtError instanceof Error ? caughtError.message : t('error')
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <AppHeader />

  <main class="detail-page">
    <p v-if="pageLoading" class="state-message">{{ t('loading') }}</p>
    <p v-else-if="error" class="state-message error-message">{{ t('error') }}: {{ error }}</p>

    <template v-else-if="currentConflict">
      <div class="top-actions">
        <button class="back-button" type="button" @click="backToConflicts">
          {{ t('backToList') }}
        </button>
        <button class="edit-button" type="button" @click="startEditing">
          {{ t('edit') }}
        </button>
      </div>

      <section v-if="isEditing" class="edit-card">
        <h2>{{ t('editConflict') }}</h2>

        <label>
          <span>{{ t('conflictName') }}</span>
          <input v-model="editForm.name" type="text" />
        </label>

        <label>
          <span>{{ t('startDate') }}</span>
          <input v-model="editForm.startDate" type="date" />
        </label>

        <label>
          <span>{{ t('status') }}</span>
          <select v-model="editForm.status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="FROZEN">FROZEN</option>
            <option value="ENDED">ENDED</option>
          </select>
        </label>

        <label>
          <span>{{ t('description') }}</span>
          <textarea v-model="editForm.description" rows="4" />
        </label>

        <div class="edit-actions">
          <button class="save-button" type="button" :disabled="saveLoading" @click="saveConflict">
            {{ t('save') }}
          </button>
          <button class="cancel-button" type="button" @click="cancelEditing">
            {{ t('cancel') }}
          </button>
        </div>
      </section>

      <section v-else class="conflict-header">
        <div class="title-row">
          <h1>{{ currentConflict.name }}</h1>
          <span class="status-badge" :class="statusClass">{{ currentConflict.status }}</span>
        </div>

        <p class="start-date">{{ t('startDate') }}: {{ formatDate(currentConflict.startDate) }}</p>
        <p class="description">{{ currentConflict.description }}</p>
      </section>

      <p v-if="secondaryError" class="state-message error-message">{{ secondaryError }}</p>

      <ConflictMap :conflictName="conflictStore.currentConflict?.name" class="map-section" />

      <section class="stats-row" aria-label="Conflict statistics">
        <StatCard :title="t('factions')" :value="factions.length" icon="🏴" color="#f59e0b" />
        <StatCard :title="t('events')" :value="events.length" icon="📅" color="#38bdf8" />
        <StatCard :title="t('status')" :value="currentConflict.status" icon="●" color="#16a34a" />
      </section>

      <section class="detail-columns">
        <SectionCard :title="t('factions')" icon="🏴">
          <template #actions>
            <span class="count-badge">{{ factions.length }}</span>
          </template>

          <p v-if="factions.length === 0" class="empty-message">{{ t('noFactions') }}</p>

          <ul v-else class="faction-list">
            <li v-for="faction in factions" :key="faction.id" class="faction-item">
              <strong>{{ faction.name }}</strong>
              <p class="supporter-title">{{ t('supporters') }}</p>

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

          <template #footer>
            <small>{{ t('totalFactions') }} {{ factions.length }}</small>
          </template>
        </SectionCard>

        <SectionCard :title="t('timeline')" icon="📅">
          <template #actions>
            <span class="count-badge">{{ sortedEvents.length }}</span>
          </template>

          <p v-if="sortedEvents.length === 0" class="empty-message">{{ t('noEvents') }}</p>

          <ol v-else class="timeline">
            <li v-for="event in sortedEvents" :key="event.id" class="timeline-event">
              <time>{{ formatDate(event.eventDate) }}</time>
              <strong>{{ event.location }}</strong>
              <p>{{ event.description }}</p>
            </li>
          </ol>
        </SectionCard>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detail-page {
  width: min(100%, 1000px);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem);
}

.top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.back-button,
.edit-button,
.save-button,
.cancel-button {
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    transform 170ms ease;
}

.back-button,
.edit-button,
.save-button {
  color: #0f172a;
  background: #f59e0b;
}

.cancel-button {
  color: #e2e8f0;
  background: #475569;
}

.back-button:hover,
.edit-button:hover,
.save-button:hover,
.cancel-button:hover {
  transform: translateY(-1px);
}

.back-button:hover,
.edit-button:hover,
.save-button:hover {
  background: #fbbf24;
}

.cancel-button:hover {
  background: #64748b;
}

.conflict-header,
.edit-card,
.state-message {
  padding: clamp(1rem, 4vw, 2rem);
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.conflict-header,
.edit-card,
.map-section {
  margin-bottom: 1.5rem;
}

.edit-card {
  display: grid;
  gap: 1rem;
}

.edit-card label {
  display: grid;
  gap: 0.45rem;
  color: #cbd5e1;
  font-weight: 700;
}

.edit-card input,
.edit-card select,
.edit-card textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  color: #ffffff;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
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
  color: #ffffff;
  font-size: 1.5rem;
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

.count-badge {
  padding: 0.25rem 0.55rem;
  color: #0f172a;
  background: #f59e0b;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
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

.supporter-title {
  margin-top: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
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
  .detail-columns,
  .edit-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
