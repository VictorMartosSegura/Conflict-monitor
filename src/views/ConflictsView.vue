<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '../components/AppHeader.vue'
import ConflictCard from '../components/ConflictCard.vue'
import { useConflictStore } from '../stores/conflictStore'

const route = useRoute()
const router = useRouter()
const conflictStore = useConflictStore()
const { conflicts, error, loading } = storeToRefs(conflictStore)

const searchQuery = ref('')
const selectedStatus = ref('ALL')
const selectedCountryCode = computed(() => route.query.country?.toString() || '')

const statusFilters = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Frozen', value: 'FROZEN' },
  { label: 'Ended', value: 'ENDED' },
]

const filteredConflicts = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  return conflicts.value.filter((conflict) => {
    const matchesStatus =
      selectedStatus.value === 'ALL' || conflict.status === selectedStatus.value
    const matchesSearch = conflict.name?.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesSearch
  })
})

onMounted(async () => {
  try {
    await conflictStore.fetchConflicts()
  } catch {
    // The store exposes the failure through error for the template.
  }
})

function selectFilter(status) {
  selectedStatus.value = status
}

function viewConflictDetails(id) {
  router.push(`/conflicts/${id}`)
}

function clearCountryFilter() {
  router.push({ path: '/conflicts' })
}
</script>

<template>
  <AppHeader />

  <main class="conflicts-page">
    <section class="page-heading">
      <p class="eyebrow">Conflict Intelligence</p>
      <h1>Conflicts</h1>
      <p class="page-summary">Track active, frozen, and ended conflicts from one operational view.</p>
    </section>

    <section class="toolbar" aria-label="Conflict filters">
      <label class="search-label">
        <span>Search by name</span>
        <input v-model="searchQuery" type="search" placeholder="Search conflicts..." />
      </label>

      <div class="status-filters" aria-label="Filter by status">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          class="filter-button"
          :class="{ 'filter-button-active': selectedStatus === filter.value }"
          type="button"
          @click="selectFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </section>

    <section v-if="selectedCountryCode" class="country-filter-note" aria-label="Country filter note">
      <div class="country-pill">
        <span>Filtered by country: {{ selectedCountryCode }}</span>
        <button type="button" @click="clearCountryFilter">Clear</button>
      </div>

      <p>Country-based filtering is currently informational (backend endpoint pending).</p>
    </section>

    <p v-if="loading" class="state-message">Loading conflicts...</p>
    <p v-else-if="error" class="state-message error-message">{{ error }}</p>

    <section v-else class="results-section" aria-label="Conflict results">
      <p class="results-count">{{ filteredConflicts.length }} conflicts found</p>

      <p v-if="filteredConflicts.length === 0" class="state-message">No conflicts found</p>

      <div v-else class="conflicts-grid">
        <ConflictCard
          v-for="conflict in filteredConflicts"
          :key="conflict.id"
          :conflict="conflict"
          @select="viewConflictDetails"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.conflicts-page {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 5rem);
}

.page-heading {
  max-width: 760px;
  margin-bottom: 2rem;
}

.eyebrow {
  margin-bottom: 0.75rem;
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  color: #ffffff;
  font-size: clamp(2rem, 6vw, 4.75rem);
  line-height: 1;
}

.page-summary {
  margin-top: 1rem;
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.7;
}

.toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-label {
  display: grid;
  flex: 1 1 360px;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 700;
}

.search-label input {
  width: 100%;
  padding: 0.9rem 1rem;
  color: #ffffff;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  outline: none;
  transition:
    border-color 170ms ease,
    box-shadow 170ms ease;
}

.search-label input:focus-visible {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

.status-filters {
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filter-button {
  padding: 0.85rem 1rem;
  color: #cbd5e1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    border-color 170ms ease,
    box-shadow 170ms ease,
    color 170ms ease,
    transform 170ms ease;
}

.filter-button-active,
.filter-button:hover {
  color: #0f172a;
  background: #f59e0b;
  border-color: #f59e0b;
}

.filter-button:hover {
  transform: translateY(-1px);
}

.filter-button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 3px;
}

.country-filter-note {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  color: #cbd5e1;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: 8px;
}

.country-filter-note p {
  line-height: 1.6;
}

.country-pill {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.country-pill span {
  padding: 0.4rem 0.65rem;
  color: #0f172a;
  background: #f59e0b;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
}

.country-pill button {
  padding: 0.45rem 0.75rem;
  color: #e2e8f0;
  background: #334155;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    box-shadow 170ms ease,
    color 170ms ease;
}

.country-pill button:hover {
  color: #0f172a;
  background: #fbbf24;
}

.country-pill button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 3px;
}

.results-section {
  display: grid;
  gap: 1rem;
}

.results-count {
  color: #94a3b8;
  font-weight: 700;
}

.conflicts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.state-message {
  padding: 1.5rem;
  color: #cbd5e1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  font-weight: 700;
}

.error-message {
  color: #fecaca;
  border-color: #dc2626;
}

@media (max-width: 760px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-label {
    flex-basis: auto;
  }

  .conflicts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
