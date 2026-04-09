<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import AppHeader from '../components/AppHeader.vue'
import { useCountryStore } from '../stores/countryStore'

const router = useRouter()
const countryStore = useCountryStore()
const { countries, countriesSortedByName, error, loading } = storeToRefs(countryStore)

const searchQuery = ref('')
const sortMode = ref('A-Z')

const filteredCountries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return countries.value
  }

  return countries.value.filter((country) => {
    const name = country.name?.toLowerCase() || ''
    const code = country.code?.toLowerCase() || ''

    return name.includes(query) || code.includes(query)
  })
})

const finalCountries = computed(() => {
  const sorted = [...filteredCountries.value]

  if (sortMode.value === 'Z-A') {
    return sorted.sort((countryA, countryB) => countryB.name.localeCompare(countryA.name))
  }

  if (sortMode.value === 'Code') {
    return sorted.sort((countryA, countryB) => countryA.code.localeCompare(countryB.code))
  }

  return sorted.sort((countryA, countryB) => countryA.name.localeCompare(countryB.name))
})

const countryStats = computed(() => {
  const firstLetters = new Set(
    countriesSortedByName.value
      .map((country) => country.name?.trim().charAt(0).toUpperCase())
      .filter(Boolean),
  )

  return {
    totalCountries: countries.value.length,
    uniqueFirstLetters: firstLetters.size,
  }
})

onMounted(async () => {
  try {
    await countryStore.fetchCountries()
  } catch {
    // The store exposes the failure through error for the template.
  }
})

function getFlag(code) {
  const flags = {
    UKR: 'ua',
    RUS: 'ru',
    USA: 'us',
    GBR: 'gb',
    FRA: 'fr',
    DEU: 'de',
    CHN: 'cn',
    ESP: 'es',
    ITA: 'it',
  }

  return flags[code] || 'un'
}

function viewCountryConflicts(code) {
  router.push({
    path: '/conflicts',
    query: { country: code },
  })
}
</script>

<template>
  <AppHeader />

  <main class="countries-page">
    <section class="page-heading">
      <p class="eyebrow">Reference Desk</p>
      <h1>Countries</h1>
      <p class="page-summary">Browse all countries in the conflict monitor</p>
    </section>

    <section class="country-overview" aria-label="Country summary">
      <article class="overview-card">
        <strong>{{ countryStats.totalCountries }}</strong>
        <span>Total countries</span>
      </article>

      <article class="overview-card">
        <strong>{{ countryStats.uniqueFirstLetters }}</strong>
        <span>Initial letters</span>
      </article>
    </section>

    <section class="toolbar" aria-label="Country filters">
      <label class="control-label">
        <span>Search name or code</span>
        <input v-model="searchQuery" type="search" placeholder="Search countries..." />
      </label>

      <label class="control-label sort-label">
        <span>Sort</span>
        <select v-model="sortMode">
          <option>A-Z</option>
          <option>Z-A</option>
          <option>Code</option>
        </select>
      </label>
    </section>

    <p v-if="loading" class="state-message">Loading countries...</p>
    <p v-else-if="error" class="state-message error-message">{{ error }}</p>

    <section v-else class="results-section" aria-label="Country results">
      <p class="results-count">{{ finalCountries.length }} countries found</p>

      <p v-if="finalCountries.length === 0" class="state-message">No countries found</p>

      <div v-else class="countries-grid">
        <article v-for="country in finalCountries" :key="country.id" class="country-card">
          <div class="country-card-top">
            <img
              :alt="`${country.name} flag`"
              :src="`https://flagcdn.com/48x36/${getFlag(country.code)}.png`"
              width="48"
              height="36"
            />

            <span class="code-badge">{{ country.code }}</span>
          </div>

          <h2>{{ country.name }}</h2>

          <button type="button" @click="viewCountryConflicts(country.code)">View Conflicts</button>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.countries-page {
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

h2 {
  color: #ffffff;
  font-size: 1.35rem;
  line-height: 1.2;
}

.page-summary {
  margin-top: 1rem;
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.7;
}

.country-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card,
.country-card,
.state-message {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.overview-card {
  padding: 1.5rem;
}

.overview-card strong {
  display: block;
  color: #ffffff;
  font-size: 2.5rem;
  line-height: 1;
}

.overview-card span,
.results-count {
  color: #94a3b8;
  font-weight: 700;
}

.toolbar {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-label {
  display: grid;
  flex: 1 1 360px;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 700;
}

.sort-label {
  flex: 0 0 180px;
}

.control-label input,
.control-label select {
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

.control-label input:focus-visible,
.control-label select:focus-visible {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.results-section {
  display: grid;
  gap: 1rem;
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.country-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  transition:
    border-color 170ms ease,
    box-shadow 170ms ease,
    transform 170ms ease;
}

.country-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 16px 32px rgba(245, 158, 11, 0.14);
  transform: translateY(-3px);
}

.country-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.country-card img {
  object-fit: cover;
  border: 1px solid #334155;
}

.code-badge {
  padding: 0.35rem 0.65rem;
  color: #0f172a;
  background: #f59e0b;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.country-card button {
  margin-top: auto;
  padding: 0.85rem 1rem;
  color: #0f172a;
  background: #f59e0b;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    box-shadow 170ms ease,
    transform 170ms ease;
}

.country-card button:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

.country-card button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 3px;
}

.state-message {
  padding: 1.5rem;
  color: #cbd5e1;
  font-weight: 700;
}

.error-message {
  color: #fecaca;
  border-color: #dc2626;
}

@media (max-width: 720px) {
  .country-overview,
  .toolbar {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .sort-label {
    flex-basis: auto;
  }
}
</style>
